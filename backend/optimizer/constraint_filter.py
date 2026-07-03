def filter_activities(activities: list[dict], travelers: list[dict]) -> list[dict]:
    all_vetoes = set()
    for t in travelers:
        all_vetoes.update(t["vetoes"])
    return [a for a in activities if not is_blocked(a, all_vetoes)]

def is_blocked(activity: dict, vetoes: set) -> bool:
    if "vegan" in vetoes and not activity.get("is_vegan_friendly", True):
        return True
    if "no_stairs" in vetoes and activity.get("requires_mobility", False):
        return True
    if "no_flights" in vetoes and activity.get("requires_flight", False):
        return True
    if "no_nightlife" in vetoes and activity.get("category") == "nightlife":
        return True
    return False