from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import GenerateRequest, CheckoutRequest
from optimizer.constraint_filter import filter_activities
from optimizer.pareto import generate_candidates, score_candidate, pareto_frontier
from optimizer.social_choice import pick_three
import json
import os
import uuid
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores
votes = {}
orders = {}

def load_activities():
    path = os.path.join(os.path.dirname(__file__), "mock_data", "activities.json")
    with open(path) as f:
        return json.load(f)

@app.get("/ping")
def ping():
    return {"status": "ok"}

@app.get("/api/activities")
def get_activities():
    return load_activities()

@app.post("/api/generate")
def generate(request: GenerateRequest):
    activities = load_activities()
    travelers = [t.dict() for t in request.travelers]

    filtered = filter_activities(activities, travelers)

    if len(filtered) < 3:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "too_many_vetoes",
                "message": (
                    f"Your combined vetoes left only {len(filtered)} activities. "
                    "Try relaxing one constraint."
                ),
                "remaining": len(filtered)
            }
        )

    candidates = generate_candidates(filtered, travelers, n=80)

    if not candidates:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "budget_too_low",
                "message": "No valid activity combinations fit within the group's shared budget."
            }
        )

    scored = [
        {"activities": c, "scores": score_candidate(c, travelers)}
        for c in candidates
    ]
    frontier = pareto_frontier(scored)
    itineraries = pick_three(frontier)

    pick_keys = set(
        tuple(a["id"] for a in it["activities"]) for it in itineraries
    )
    frontier_data = []
    for s in scored:
        key = tuple(a["id"] for a in s["activities"])
        criterion = next(
            (it["fairness_criterion"] for it in itineraries
             if tuple(a["id"] for a in it["activities"]) == key),
            None
        )
        frontier_data.append({
            "total_cost": sum(a["cost"] for a in s["activities"]),
            "group_score": round(sum(s["scores"].values()), 3),
            "is_pareto": s in frontier,
            "fairness_criterion": criterion
        })

    return {
        "itineraries": itineraries,
        "frontier_data": frontier_data,
        "stats": {
            "total_activities": len(activities),
            "after_filter": len(filtered),
            "candidates_generated": len(candidates),
            "pareto_frontier_size": len(frontier),
            "itineraries_selected": len(itineraries)
        }
    }

@app.post("/api/vote")
def vote(trip_id: str, traveler_id: str, chosen_criterion: str, num_travelers: int):
    if trip_id not in votes:
        votes[trip_id] = {}

    votes[trip_id][traveler_id] = chosen_criterion
    current = votes[trip_id]

    winner = None
    if len(current) >= num_travelers:
        winner = max(set(current.values()), key=list(current.values()).count)

    return {
        "votes": current,
        "winner": winner,
        "votes_cast": len(current),
        "votes_needed": num_travelers
    }

@app.get("/api/votes/{trip_id}")
def get_votes(trip_id: str):
    return votes.get(trip_id, {})

@app.post("/api/checkout")
def checkout(request: CheckoutRequest):
    order_id = str(uuid.uuid4())[:8].upper()

    order = {
        "order_id": order_id,
        "package_id": request.package_id,
        "trip_id": request.trip_id,
        "travelers": request.traveler_names,
        "payment_method": request.payment_method,
        "status": "confirmed",
        "purchased_at": datetime.utcnow().isoformat(),
    }

    orders[order_id] = order

    return {
        "success": True,
        "order_id": order_id,
        "message": f"Your travel package has been booked! Order ID: {order_id}",
        "order": order
    }

@app.get("/api/orders/{order_id}")
def get_order(order_id: str):
    if order_id not in orders:
        raise HTTPException(status_code=404, detail="Order not found")
    return orders[order_id]