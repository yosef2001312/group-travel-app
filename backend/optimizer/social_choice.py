def format_result(candidate: dict, criterion: str, explanation: str) -> dict:
    base_cost = sum(a["cost"] for a in candidate["activities"])
    markup = 1.15  # 15% service fee, like a real travel agency
    package_price = round(base_cost * markup, 2)
    
    # Generate a title based on the activities
    categories = list(set(a["category"] for a in candidate["activities"]))
    title = " & ".join(c.capitalize() for c in categories[:2]) + " Travel Package"

    return {
        "package_id": f"pkg-{criterion[:3]}-{abs(hash(tuple(a['id'] for a in candidate['activities']))) % 10000}",
        "title": title,
        "description": explanation,
        "fairness_criterion": criterion,
        "activities": candidate["activities"],
        "activities_count": len(candidate["activities"]),
        "base_cost": base_cost,
        "service_fee": round(base_cost * 0.15, 2),
        "total_price": package_price,
        "currency": "USD",
        "per_traveler_score": candidate["scores"],
        "status": "available"
    }

def utilitarian(frontier: list[dict]) -> dict:
    """Pick the itinerary that maximizes the SUM of all traveler scores."""
    best = max(frontier, key=lambda c: sum(c["scores"].values()))
    total = round(sum(best["scores"].values()), 2)
    return format_result(best, "utilitarian",
        f"Maximizes total group happiness (combined score: {total})")


def leximin(frontier: list[dict]) -> dict:
    """Pick the itinerary that maximizes the MINIMUM traveler score."""
    best = max(frontier, key=lambda c: min(c["scores"].values()))
    min_score = round(min(best["scores"].values()) * 100)
    return format_result(best, "leximin",
        f"Best for the least-happy traveler (minimum score: {min_score}%)")


def majority(frontier: list[dict], threshold: float = 0.6) -> dict:
    """Pick the itinerary where the most travelers score above threshold."""
    def majority_count(c):
        return sum(1 for s in c["scores"].values() if s >= threshold)
    best = max(frontier, key=majority_count)
    count = majority_count(best)
    total = len(best["scores"])
    return format_result(best, "majority",
        f"{count} out of {total} travelers score above 60%")


def pick_three(frontier: list[dict]) -> list[dict]:
    if not frontier:
        return []
    
    if len(frontier) == 1:
        # Only one option — return it labeled as all three criteria
        result = format_result(frontier[0], "utilitarian", "Only one valid itinerary found")
        return [result]
    
    u = utilitarian(frontier)
    l = leximin(frontier)
    m = majority(frontier)

    seen = set()
    results = []
    for r in [u, l, m]:
        key = tuple(a["id"] for a in r["activities"])
        if key not in seen:
            seen.add(key)
            results.append(r)

    return results
