from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import Traveler, CheckoutRequest
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

# --- IN-MEMORY DATABASES ---
groups_db = {}
orders = {}

# --- NEW REQUEST MODELS ---
class CreateGroupRequest(BaseModel):
    expected_travelers: int

class VoteRequest(BaseModel):
    traveler_id: str
    chosen_criterion: str

class FinalizeRequest(BaseModel):
    chosen_package_id: str

# --- UTILS ---
def load_activities():
    path = os.path.join(os.path.dirname(__file__), "mock_data", "activities.json")
    with open(path) as f:
        return json.load(f)

# --- SYSTEM ENDPOINTS ---
@app.get("/ping")
def ping():
    return {"status": "ok"}

@app.get("/api/activities")
def get_activities():
    return load_activities()

# --- GROUP LOBBY ENDPOINTS ---
@app.post("/api/groups")
def create_group(req: CreateGroupRequest):
    """Creates a new group lobby and returns the invite code."""
    group_id = f"GRP-{uuid.uuid4().hex[:6].upper()}"
    
    groups_db[group_id] = {
        "group_id": group_id,
        "expected_travelers": req.expected_travelers,
        "status": "collecting",
        "travelers": [],
        "admin_traveler_id": None,
        "results": None,
        "votes": {},
        "final_package_id": None,
        "order_id": None,
    }
    return {"group_id": group_id}

@app.post("/api/groups/{group_id}/join")
def join_group(group_id: str, traveler: Traveler):
    """Allows a traveler to submit their preferences to a specific group."""
    if group_id not in groups_db:
        raise HTTPException(status_code=404, detail="Group not found")
        
    group = groups_db[group_id]
    
    if group["status"] != "collecting":
        raise HTTPException(status_code=400, detail="Group is no longer accepting members")

    is_first = len(group["travelers"]) == 0
    group["travelers"].append(traveler.model_dump())
    
    if is_first:
        group["admin_traveler_id"] = traveler.id
        
    if len(group["travelers"]) >= group["expected_travelers"]:
        group["status"] = "ready"
        
    return {
        "joined": len(group["travelers"]),
        "expected": group["expected_travelers"],
        "is_admin": is_first,
        "status": group["status"],
    }

@app.get("/api/groups/{group_id}")
def get_group(group_id: str):
    """Used by the frontend waiting room to poll for live updates."""
    if group_id not in groups_db:
        raise HTTPException(status_code=404, detail="Group not found")
    return groups_db[group_id]


# --- ALGORITHM & GENERATION ---
@app.post("/api/groups/{group_id}/generate")
def generate_for_group(group_id: str):
    """Admin triggers this to run the algorithms on the group's collected data."""
    if group_id not in groups_db:
        raise HTTPException(status_code=404, detail="Group not found")
        
    group = groups_db[group_id]
    
    if group["status"] != "ready":
        raise HTTPException(status_code=400, detail="Group is not ready to generate yet")

    activities = load_activities()
    travelers = group["travelers"]

    # 1. Constraint Filter
    filtered = filter_activities(activities, travelers)
    if len(filtered) < 3:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "too_many_vetoes",
                "message": f"Your combined vetoes left only {len(filtered)} activities. Try relaxing one constraint.",
                "remaining": len(filtered)
            }
        )

    # 2. Pareto Candidates
    candidates = generate_candidates(filtered, travelers, n=80)
    if not candidates:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "budget_too_low",
                "message": "No valid activity combinations fit within the group's shared budget."
            }
        )

    scored = [{"activities": c, "scores": score_candidate(c, travelers)} for c in candidates]
    frontier = pareto_frontier(scored)
    
    # 3. Social Choice
    itineraries = pick_three(frontier)

    # 4. Format Frontier Data for the UI Chart
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

    group["results"] = {
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
    group["status"] = "voting"

    return group["results"]


# --- VOTING & DECISION ---
@app.post("/api/groups/{group_id}/vote")
def vote(group_id: str, req: VoteRequest):
    if group_id not in groups_db:
        raise HTTPException(status_code=404, detail="Group not found")
        
    group = groups_db[group_id]
    group["votes"][req.traveler_id] = req.chosen_criterion
    
    return {
        "votes": group["votes"],
        "votes_cast": len(group["votes"]),
        "votes_needed": group["expected_travelers"]
    }

@app.post("/api/groups/{group_id}/finalize")
def finalize(group_id: str, req: FinalizeRequest):
    if group_id not in groups_db:
        raise HTTPException(status_code=404, detail="Group not found")
        
    group = groups_db[group_id]
    group["final_package_id"] = req.chosen_package_id
    group["status"] = "decided"
    
    return {"status": group["status"], "final_package_id": req.chosen_package_id}


# --- E-COMMERCE CHECKOUT ---
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