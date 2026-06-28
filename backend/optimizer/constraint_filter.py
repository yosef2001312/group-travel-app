def filter_activities(activities: list[dict], travelers: list[dict]) -> list[dict]:
    """
    Takes a list of activity dictionaries and a list of traveler dictionaries.
    Returns only the activities that pass EVERY traveler's hard vetoes.
    """
    # Collect all unique vetoes from all travelers into one set
    all_vetoes = set(v for t in travelers for v in t["vetoes"])
    
    # Keep the activity only if it is NOT blocked
    return [a for a in activities if not is_blocked(a, all_vetoes)]

def is_blocked(activity: dict, vetoes: set) -> bool:
    """
    Checks a single activity against the combined set of vetoes.
    Returns True if the activity should be removed.
    """
    if "vegan" in vetoes and not activity["is_vegan_friendly"]:
        return True
    if "no_stairs" in vetoes and activity["requires_mobility"]:
        return True
    if "no_flights" in vetoes and activity.get("requires_flight", False):
        return True
    if "no_nightlife" in vetoes and activity["category"] == "nightlife":
        return True
    
    return False