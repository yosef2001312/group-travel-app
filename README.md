# Group Travel App

A group plans a trip together, each person from their own device. One person creates a group and picks a destination; everyone else joins with a shared code and enters their own preferences. The app filters out anything that breaks a hard constraint, finds the genuine trade-offs between cost and group satisfaction, and presents 3 finished packages. The group votes, the admin makes the final call, and each traveler buys their own ticket — with an optional AI-suggested hotel area at the end.

## Team

- **Person A** — algorithm (constraint filter, Pareto search, social choice) + the AI hotel suggestion logic
- **Person B** — backend (FastAPI, SQLite, all endpoints)
- **Person C** — frontend (every page, the visual design system)

## Running the project

This needs **two servers running at the same time, in two separate terminals** — the frontend won't work without the backend also running.

### 1. Backend setup

```
cd backend
```

Create and activate a virtual environment:

```
python -m venv venv
.\venv\Scripts\Activate.ps1
```

(If PowerShell blocks this with an execution policy error, run
`Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned`
first, then try activating again.)

Install dependencies:

```
python -m pip install -r requirements.txt
```

Add your Gemini API key — create a file called `.env` inside the `backend/` folder with this content:

```
GEMINI_API_KEY=your_key_here
```

Get a free key at: https://aistudio.google.com/app/apikey

Set up the database — run this once only:

```
python setup_db.py
```

Start the server:

```
python -m uvicorn main:app --reload
```

The API runs at http://localhost:8000
Interactive docs at http://localhost:8000/docs

### 2. Frontend setup

In a **second, separate terminal**:

```
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173

## Endpoints

```
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
```

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

## Frontend

Built with React + Vite. No external UI library — the design system is custom CSS (in `index.css`), built around a travel-document visual theme: package cards are styled as torn ticket stubs with a stamped fairness-criterion badge, prices and codes use a monospace font (like a real boarding pass), and the background is an illustrated journey scene (dashed flight path, drifting hot-air balloon, clouds, a mountain horizon).

Pages:

- `LandingPage` — choose to create a new group or join an existing one
- `CreateGroupPage` — pick a destination and traveler count, get a shareable group code
- `JoinGroupPage` — enter a group code to join
- `TravelerForm` — one traveler's own preferences: name, budget, 1–10 interest sliders per category (6+ counts as a favorite), hard requirement toggles (vegan / step-free / no flights), and pace
- `WaitingRoomPage` — polls for group status; the admin sees a Generate button once everyone's joined
- `ResultsVotePage` — shows the 3 generated packages; each traveler votes for their own favorite
- `AdminReviewPage` — admin-only; sees the vote tally and picks the final package
- `BuyPage` — the finalized package with its per-person price; each traveler buys their own ticket independently
- `ConfirmationPage` — order confirmation, with an optional AI hotel-area suggestion and a real Booking.com search link

`ItineraryCard` is a shared component used on both the results and buy pages, styled as the torn-ticket design described above.

## Notes

- Group state is in memory and resets when the server restarts
- Hotel suggestion uses Gemini AI with a plain fallback if the call fails