import random

def generate_candidates(activities: list[dict], travelers: list[dict], n: int = 80) -> list[list[dict]]:
    """Generate random valid combinations of 3-5 activities that fit the group's shared budget."""
    if not activities:
        return []

    max_budget = min(t["budget_max"] for t in travelers)
    candidates = []
    attempts = 0
    max_attempts = n * 10

    while len(candidates) < n and attempts < max_attempts:
        attempts += 1
        size = random.randint(3, min(5, len(activities)))
        combo = random.sample(activities, size)
        total_cost = sum(a["cost"] for a in combo)
        if total_cost <= max_budget:
            candidates.append(combo)

    return candidates


def score_candidate(combo: list[dict], travelers: list[dict]) -> dict[str, float]:
    """Score one itinerary combo for each traveler: 70% category match, 30% budget fit."""
    scores = {}
    for t in travelers:
        category_matches = sum(
            1 for a in combo if a["category"] in t["preferred_categories"]
        )
        category_score = category_matches / len(combo)

        total_cost = sum(a["cost"] for a in combo)
        cost_ratio = total_cost / t["budget_max"] if t["budget_max"] > 0 else 1
        budget_score = max(0, 1 - cost_ratio)

        scores[t["id"]] = round(0.7 * category_score + 0.3 * budget_score, 3)
    return scores


def is_dominated(scores_a: dict, scores_b: dict) -> bool:
    """True if b dominates a: b is >= a on every traveler, and > a on at least one."""
    vals_a = list(scores_a.values())
    vals_b = list(scores_b.values())
    all_at_least_as_good = all(b >= a for a, b in zip(vals_a, vals_b))
    at_least_one_better = any(b > a for a, b in zip(vals_a, vals_b))
    return all_at_least_as_good and at_least_one_better


def pareto_frontier(scored_candidates: list[dict]) -> list[dict]:
    """Return only the candidates that are not dominated by any other candidate."""
    frontier = []
    for i, candidate in enumerate(scored_candidates):
        dominated = any(
            is_dominated(candidate["scores"], other["scores"])
            for j, other in enumerate(scored_candidates)
            if i != j
        )
        if not dominated:
            frontier.append(candidate)
    return frontier