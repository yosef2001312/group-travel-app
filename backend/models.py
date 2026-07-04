from pydantic import BaseModel
from typing import Optional

# ─── Input Models ───────────────────────────────────────────

class Traveler(BaseModel):
    id: str
    name: str
    budget_max: float
    preferred_categories: list[str]   # "culture" | "food" | "nature" | "nightlife" | "adventure"
    vetoes: list[str]                 # "vegan" | "no_stairs" | "no_flights" | "no_nightlife"

class GenerateRequest(BaseModel):
    travelers: list[Traveler]

class CheckoutRequest(BaseModel):
    package_id: str
    trip_id: str
    traveler_names: list[str]
    payment_method: str = "credit_card"

# ─── Activity Model ──────────────────────────────────────────

class Activity(BaseModel):
    id: str
    name: str
    category: str
    cost: float
    duration_hrs: float
    requires_mobility: bool
    is_vegan_friendly: bool
    requires_flight: bool = False

# ─── Package / Itinerary Model ───────────────────────────────

class TravelPackage(BaseModel):
    package_id: str                        # e.g. "pkg-uti-7802"
    title: str                             # e.g. "Culture & Food Travel Package"
    description: str                       # plain language explanation of why this was chosen
    fairness_criterion: str                # "utilitarian" | "leximin" | "majority"
    activities: list[Activity]
    activities_count: int
    base_cost: float                       # sum of all activity costs
    service_fee: float                     # 15% markup
    total_price: float                     # base_cost + service_fee
    currency: str                          # "USD"
    per_traveler_score: dict[str, float]   # {"t1": 0.85, "t2": 0.72, "t3": 0.63}
    status: str                            # "available"

# ─── Frontier Data Point (for Pareto chart) ──────────────────

class FrontierPoint(BaseModel):
    total_cost: float
    group_score: float
    is_pareto: bool
    fairness_criterion: Optional[str] = None   # set only for the 3 picked packages

# ─── API Response Models ─────────────────────────────────────

class GenerateResponse(BaseModel):
    itineraries: list[TravelPackage]
    frontier_data: list[FrontierPoint]
    stats: dict

# ─── Order Model ─────────────────────────────────────────────

class Order(BaseModel):
    order_id: str
    package_id: str
    trip_id: str
    travelers: list[str]
    payment_method: str
    status: str                # "confirmed"
    purchased_at: str          # ISO timestamp

class CheckoutResponse(BaseModel):
    success: bool
    order_id: str
    message: str
    order: Order

# ─── Vote Models ─────────────────────────────────────────────

class VoteResponse(BaseModel):
    votes: dict[str, str]      # {"t1": "leximin", "t2": "utilitarian"}
    winner: Optional[str]      # None until all votes are cast
    votes_cast: int
    votes_needed: int


class CreateGroupRequest(BaseModel):
    expected_travelers: int

class FinalizeRequest(BaseModel):
    chosen_package_id: str