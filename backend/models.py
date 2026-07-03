from pydantic import BaseModel

class Activity(BaseModel):
    id: str
    name: str
    category: str
    cost: float
    duration_hrs: float
    requires_mobility: bool
    is_vegan_friendly: bool
    requires_flight: bool = False

class Traveler(BaseModel):
    id: str
    name: str
    budget_max: float
    preferred_categories: list[str]
    vetoes: list[str]

class Itinerary(BaseModel):
    activities: list[Activity]
    total_cost: float
    per_traveler_score: dict[str, float]
    fairness_criterion: str
    explanation: str

class GenerateRequest(BaseModel):
    travelers: list[Traveler]

class CheckoutRequest(BaseModel):
    package_id: str
    trip_id: str
    traveler_names: list[str]
    payment_method: str = "credit_card"