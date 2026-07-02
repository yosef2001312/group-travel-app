import ItineraryCard from '../components/ItineraryCard'

const MOCK_ITINERARIES = [
  {
    fairness_criterion: 'utilitarian',
    explanation: 'Highest total group satisfaction — best on average, but not even for everyone',
    total_cost: 85,
    activities: [
      { id: 'a09', name: 'Wine tasting', cost: 35, duration_hrs: 2 },
      { id: 'a07', name: 'Rooftop bar night', cost: 40, duration_hrs: 3 },
      { id: 'a11', name: 'Old town walking tour', cost: 10, duration_hrs: 2 },
    ],
    per_traveler_score: { t1: 0.50, t2: 0.95, t3: 0.65 },
  },
  {
    fairness_criterion: 'leximin',
    explanation: 'Best for your least-happy traveler — nobody scores too low',
    total_cost: 40,
    activities: [
      { id: 'a05', name: 'Coastal hike', cost: 0, duration_hrs: 4 },
      { id: 'a03', name: 'City museum', cost: 15, duration_hrs: 3 },
      { id: 'a01', name: 'Street food tour', cost: 25, duration_hrs: 2 },
    ],
    per_traveler_score: { t1: 0.70, t2: 0.60, t3: 0.70 },
  },
  {
    fairness_criterion: 'majority',
    explanation: 'Gets the most travelers above a good-enough bar',
    total_cost: 45,
    activities: [
      { id: 'a05', name: 'Coastal hike', cost: 0, duration_hrs: 4 },
      { id: 'a09', name: 'Wine tasting', cost: 35, duration_hrs: 2 },
      { id: 'a11', name: 'Old town walking tour', cost: 10, duration_hrs: 2 },
    ],
    per_traveler_score: { t1: 0.65, t2: 0.65, t3: 0.80 },
  },
]

export default function ResultsPage() {
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Your trip packages</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
        Debug: hardcoded mock data — Day 4 wires this to the real API
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {MOCK_ITINERARIES.map((it, i) => (
          <ItineraryCard key={i} itinerary={it} />
        ))}
      </div>
    </div>
  )
}