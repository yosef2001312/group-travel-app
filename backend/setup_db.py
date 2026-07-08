import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "activities.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "mock_data", "activities.json")

def setup():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DROP TABLE IF EXISTS activities")
    c.execute("""
        CREATE TABLE activities (
            id TEXT PRIMARY KEY,
            country TEXT NOT NULL,
            city TEXT NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            cost REAL NOT NULL,
            duration_hrs REAL NOT NULL,
            requires_mobility INTEGER NOT NULL,
            is_vegan_friendly INTEGER NOT NULL,
            requires_flight INTEGER NOT NULL DEFAULT 0
        )
    """)
    with open(JSON_PATH) as f:
        activities = json.load(f)
    for a in activities:
        c.execute(
            "INSERT INTO activities VALUES (?,?,?,?,?,?,?,?,?,?)",
            (
                a["id"],
                a.get("country", ""),
                a.get("city", ""),
                a["name"],
                a["category"],
                a["cost"],
                a["duration_hrs"],
                1 if a["requires_mobility"] else 0,
                1 if a["is_vegan_friendly"] else 0,
                1 if a.get("requires_flight", False) else 0
            )
        )
    conn.commit()
    conn.close()
    print(f"Done — {len(activities)} activities inserted into {DB_PATH}")

if __name__ == "__main__":
    setup()