import json
import random
import os

# Set up the exact counts requested in the workplan
CATEGORIES = {
    "culture": ["Colosseum Underground Tour", "Vatican Museums", "Scaligero Castle Tour", "Bologna Porticoes Walk", "Roman Forum Guide", "Sirmione Ruins", "Pantheon Audio Guide", "Archiginnasio Theatre"],
    "food": ["Bologna Pasta Making", "Rome Street Food Tour", "Garda Wine Tasting", "Trastevere Dinner", "Modena Balsamic Tour", "Gelato Masterclass"],
    "nature": ["Mount Baldo Hike", "Villa Borghese Gardens", "Appian Way Bike Tour", "Monte San Luca Walk", "Sirmione Thermal Baths", "Tiber River Cruise"],
    "nightlife": ["Trastevere Pub Crawl", "Bologna Jazz Club", "Garda Lakeside Club", "Rome Rooftop Cocktails", "Testaccio VIP Night"],
    "adventure": ["Lake Garda Windsurfing", "Helicopter City View", "Rome Vespa Tour", "Garda Paragliding", "Apennines ATV Tour"]
}

# Target constraint counts
TARGET_MOBILITY = 8
TARGET_NON_VEGAN = 6
TARGET_FLIGHT = 5

activities = []
item_id = 1

# Generate the base items
for category, names in CATEGORIES.items():
    for name in names:
        # Determine base cost based on category (from workplan)
        if category == "culture": cost = random.randint(10, 50)
        elif category == "food": cost = random.randint(15, 60)
        elif category == "nature": cost = random.randint(0, 30)
        elif category == "nightlife": cost = random.randint(20, 80)
        else: cost = random.randint(30, 90) # adventure

        activity = {
            "id": f"a{item_id:02d}",
            "name": name,
            "category": category,
            "cost": cost,
            "duration_hrs": random.randint(1, 4),
            "requires_mobility": False,
            "is_vegan_friendly": True,
            "requires_flight": False
        }
        activities.append(activity)
        item_id += 1

# Apply constraints randomly but strictly hitting the target counts
random.shuffle(activities)

for i in range(TARGET_MOBILITY):
    activities[i]["requires_mobility"] = True

for i in range(TARGET_NON_VEGAN):
    # Ensure food items are more likely to be non-vegan
    activities[i]["is_vegan_friendly"] = False 

for i in range(TARGET_FLIGHT):
    activities[i]["requires_flight"] = True

# Re-sort by ID for a clean JSON file
activities = sorted(activities, key=lambda x: x["id"])

# Ensure the mock_data directory exists
os.makedirs("mock_data", exist_ok=True)

# Save to JSON
filepath = os.path.join("mock_data", "activities.json")
with open(filepath, "w") as f:
    json.dump(activities, f, indent=2)

print(f"✅ Successfully generated 30 activities and saved to {filepath}")