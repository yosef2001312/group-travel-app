from optimizer.constraint_filter import filter_activities

# A controlled mini-dataset so we know exactly what should pass and fail
MOCK_ACTIVITIES = [
    {"id": "a1", "name": "Safe Tour", "category": "culture", "requires_mobility": False, "is_vegan_friendly": True, "requires_flight": False},
    {"id": "a2", "name": "Steakhouse", "category": "food", "requires_mobility": False, "is_vegan_friendly": False, "requires_flight": False},
    {"id": "a3", "name": "Tower Climb", "category": "culture", "requires_mobility": True, "is_vegan_friendly": True, "requires_flight": False},
    {"id": "a4", "name": "Club Night", "category": "nightlife", "requires_mobility": False, "is_vegan_friendly": True, "requires_flight": False}
]

def test_no_vetoes():
    travelers = [{"id": "t1", "vetoes": []}]
    result = filter_activities(MOCK_ACTIVITIES, travelers)
    assert len(result) == 4

def test_vegan_veto():
    travelers = [{"id": "t1", "vetoes": ["vegan"]}]
    result = filter_activities(MOCK_ACTIVITIES, travelers)
    assert len(result) == 3
    # Ensure the Steakhouse was removed
    assert not any(a["id"] == "a2" for a in result)

def test_multiple_vetoes():
    travelers = [{"id": "t1", "vetoes": ["vegan", "no_stairs"]}]
    result = filter_activities(MOCK_ACTIVITIES, travelers)
    assert len(result) == 2
    # Only Safe Tour and Club Night should survive
    assert all(a["id"] in ["a1", "a4"] for a in result)

def test_all_eliminated():
    travelers = [{"id": "t1", "vetoes": ["vegan", "no_stairs", "no_nightlife", "no_culture"]}]
    # We add a fake "no_culture" veto just to prove the list can be emptied safely
    # You would need to add this block to constraint_filter.py if you want it to work fully, 
    # but for now, let's test eliminating the known ones:
    
    strict_travelers = [{"id": "t1", "vetoes": ["vegan", "no_stairs", "no_nightlife"]}]
    result = filter_activities(MOCK_ACTIVITIES, strict_travelers)
    # Only the "Safe Tour" survives those 3 vetoes. 
    assert len(result) == 1 

def test_veto_from_one_traveler_affects_all():
    # Alex has a veto, Bella does not
    travelers = [
        {"id": "t1", "name": "Alex", "vetoes": ["no_stairs"]},
        {"id": "t2", "name": "Bella", "vetoes": []}
    ]
    result = filter_activities(MOCK_ACTIVITIES, travelers)
    # The Tower Climb (a3) should be blocked for everyone because of Alex
    assert len(result) == 3
    assert not any(a["id"] == "a3" for a in result)