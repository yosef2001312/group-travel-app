import uuid

def utilitarian(frontier):
    """Max SUM of all traveler scores — best total happiness"""
    best = max(frontier, key=lambda c: sum(c["scores"].values()))
    return format_result(
        best, 
        "utilitarian",
        "Maximizes total happiness across all travelers.",
        "The Utilitarian Package"
    )

def leximin(frontier):
    """Max MINIMUM score — best outcome for the least-happy traveler"""
    best = max(frontier, key=lambda c: min(c["scores"].values()))
    min_score = round(min(best['scores'].values()) * 100)
    return format_result(
        best, 
        "leximin",
        f"Fairest for all: Guarantees your least-happy traveler scores at least {min_score}%.",
        "The Egalitarian Package"
    )

def majority(frontier, threshold=0.6):
    """Max travelers scoring above threshold"""
    def majority_score(c):
        return sum(1 for s in c["scores"].values() if s >= threshold)
    
    best = max(frontier, key=majority_score)
    count = majority_score(best)
    return format_result(
        best, 
        "majority",
        f"The Popular Choice: {count} out of {len(best['scores'])} travelers score above 60%.",
        "The Majority Rules Package"
    )

def format_result(candidate, criterion, description, title):
    """Transforms a raw algorithm candidate into a purchasable TravelPackage"""
    base_cost = float(sum(a["cost"] for a in candidate["activities"]))
    service_fee = round(base_cost * 0.15, 2)  # 15% e-commerce markup
    total_price = round(base_cost + service_fee, 2)
    
    return {
        "package_id": f"pkg-{criterion[:3]}-{str(uuid.uuid4())[:6]}",
        "title": title,
        "description": description,
        "fairness_criterion": criterion,
        "activities": candidate["activities"],
        "activities_count": len(candidate["activities"]),
        "base_cost": base_cost,
        "service_fee": service_fee,
        "total_price": total_price,
        "currency": "USD",
        "per_traveler_score": candidate["scores"],
        "status": "available"
    }

def pick_three(frontier):
    """Selects the top 3 packages based on the social choice criteria"""
    if not frontier:
        return []
        
    u = utilitarian(frontier)
    l = leximin(frontier)
    m = majority(frontier)
    
    # Deduplicate in case two criteria pick the exact same itinerary
    seen = set()
    results = []
    
    for r in [u, l, m]:
        # Create a unique tuple of activity IDs to check for duplicates
        key = tuple(sorted(a["id"] for a in r["activities"]))
        if key not in seen:
            seen.add(key)
            results.append(r)
            
    return results