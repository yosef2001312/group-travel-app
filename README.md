# Group Travel App — Backend

A FastAPI backend that takes group travel preferences and returns 3 fairly-priced travel packages using a 3layer algorithm: constraint filtering, Pareto optimization, and social choice theory.

## Setup

### 1. Create and activate a virtual environment

python -m venv venv
venv\Scripts\activate

### 2. Install dependencies

python -m pip install -r requirements.txt

### 3. Add your Gemini API key

Create a file called .env inside the backend/ folder with this content:

GEMINI_API_KEY=your_key_here

Get a free key at: https://aistudio.google.com/app/apikey

### 4. Set up the database — run this once only

cd backend
python setup_db.py

### 5. Start the server

cd backend
python -m uvicorn main:app --reload

The API runs at http://localhost:8000
Interactive docs at http://localhost:8000/docs

## Endpoints

GET  /ping
GET  /api/destinations
POST /api/groups
POST /api/groups/{id}/join
GET  /api/groups/{id}
POST /api/groups/{id}/generate
POST /api/groups/{id}/vote
POST /api/groups/{id}/finalize
POST /api/checkout
GET  /api/orders/{order_id}
POST /api/groups/{id}/suggest-hotel

## Group status flow

collecting → ready → voting → decided

collecting  — waiting for travelers to join
ready       — all travelers joined, admin can generate
voting      — packages generated, travelers can vote
decided     — admin finalized, travelers can buy independently

## Algorithm

Three layers run in sequence inside POST /api/groups/{id}/generate:

Layer 1 — Constraint filter
Removes any activity that violates any single traveler's hard veto.
One veto from one traveler eliminates that activity for everyone.

Layer 2 — Pareto optimizer
Generates 80 random candidate itineraries within the shared budget.
Keeps only non-dominated ones — the real trade-offs where you cannot
improve one traveler's score without hurting another's.

Layer 3 — Social choice
Picks 3 packages from the Pareto frontier using three fairness criteria:
- Utilitarian: maximises total group happiness
- Leximin: maximises the minimum score (best for the least-happy traveler)
- Majority: maximises the number of travelers scoring above 60%

Each package includes a title, base cost, 15% service fee, and total price.

## Notes

- Group state is in memory and resets when the server restarts
- Hotel suggestion uses Gemini AI with a plain fallback if the call fails
- Never commit your .env file — it is listed in .gitignore