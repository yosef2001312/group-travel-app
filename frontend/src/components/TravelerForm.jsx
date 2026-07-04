import { useState } from 'react'

const CATEGORIES = ['culture', 'food', 'nature', 'nightlife', 'adventure']
const VETOES = [
  { id: 'vegan', label: 'Vegan food only' },
  { id: 'no_stairs', label: 'No stairs / step-free access' },
  { id: 'no_flights', label: 'No flights' },
]
const PACES = ['morning', 'flexible', 'evening']

const DEMO = [
  { id: 't1', name: 'Alex', budget_max: 50, preferred_categories: ['nature', 'culture'], vetoes: ['vegan', 'no_stairs'] },
  { id: 't2', name: 'Bella', budget_max: 200, preferred_categories: ['nightlife', 'food'], vetoes: [] },
  { id: 't3', name: 'Chris', budget_max: 100, preferred_categories: ['culture', 'food'], vetoes: ['no_stairs'] },
]

// Fallback sample data — preview the Results page without a live backend. Remove Day 6.
const SAMPLE_ITINERARIES = [
  {
    package_id: 'pkg-uti-sample', title: 'Culture & Nightlife Package',
    description: 'Highest total group satisfaction — best on average, but not even for everyone',
    fairness_criterion: 'utilitarian', base_cost: 85, service_fee: 12.75, total_price: 97.75, currency: 'USD',
    activities: [
      { id: 'a09', name: 'Wine tasting', cost: 35, duration_hrs: 2 },
      { id: 'a07', name: 'Rooftop bar night', cost: 40, duration_hrs: 3 },
      { id: 'a11', name: 'Old town walking tour', cost: 10, duration_hrs: 2 },
    ],
    per_traveler_score: { t1: 0.50, t2: 0.95, t3: 0.65 },
  },
  {
    package_id: 'pkg-lex-sample', title: 'Nature & Culture Package',
    description: 'Best for your least-happy traveler — nobody scores too low',
    fairness_criterion: 'leximin', base_cost: 40, service_fee: 6.0, total_price: 46.0, currency: 'USD',
    activities: [
      { id: 'a05', name: 'Coastal hike', cost: 0, duration_hrs: 4 },
      { id: 'a03', name: 'City museum', cost: 15, duration_hrs: 3 },
      { id: 'a01', name: 'Street food tour', cost: 25, duration_hrs: 2 },
    ],
    per_traveler_score: { t1: 0.70, t2: 0.60, t3: 0.70 },
  },
  {
    package_id: 'pkg-maj-sample', title: 'Balanced Explorer Package',
    description: 'Gets the most travelers above a good-enough bar',
    fairness_criterion: 'majority', base_cost: 45, service_fee: 6.75, total_price: 51.75, currency: 'USD',
    activities: [
      { id: 'a05', name: 'Coastal hike', cost: 0, duration_hrs: 4 },
      { id: 'a09', name: 'Wine tasting', cost: 35, duration_hrs: 2 },
      { id: 'a11', name: 'Old town walking tour', cost: 10, duration_hrs: 2 },
    ],
    per_traveler_score: { t1: 0.65, t2: 0.65, t3: 0.80 },
  },
]
const SAMPLE_STATS = { total_activities: 30, after_filter: 18, candidates_generated: 80, pareto_frontier_size: 12, itineraries_selected: 3 }

function emptyTraveler(id) {
  return { id, name: '', budget_max: 100, preferred_categories: [], vetoes: [], pace: 'flexible' }
}

export default function TravelerForm({ onResults }) {
  const [travelers, setTravelers] = useState([emptyTraveler('t1')])
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  function updateTraveler(id, changes) {
    setTravelers(travelers.map(t => (t.id === id ? { ...t, ...changes } : t)))
  }

  function toggleListValue(id, field, value) {
    const traveler = travelers.find(t => t.id === id)
    const current = traveler[field]
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    updateTraveler(id, { [field]: next })
  }

  function addTraveler() {
    if (travelers.length >= 4) return
    setTravelers([...travelers, emptyTraveler('t' + (travelers.length + 1))])
  }

  function removeTraveler(id) {
    setTravelers(travelers.filter(t => t.id !== id))
  }

  function loadDemo() {
    setTravelers(DEMO.map(t => ({ pace: 'flexible', ...t })))
    setApiError(null)
  }

  async function generate() {
    setLoading(true)
    setApiError(null)
    try {
      const res = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travelers }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setApiError(err?.detail?.message || `Server responded with ${res.status}`)
        return
      }
      const data = await res.json()
      console.log('API response:', data)
onResults({ itineraries: data.itineraries, stats: data.stats, frontier: data.frontier_data, travelers })
    } catch (err) {
      console.error('Generate failed:', err)
      setApiError('Could not reach the backend — is it running yet? (' + err.message + ')')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <h1>Trip travelers</h1>
      <button onClick={loadDemo} style={{ marginBottom: 16 }}>Load demo scenario</button>

      {travelers.map((traveler, index) => (
        <div key={traveler.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Traveler {index + 1}</h3>
            {travelers.length > 1 && <button onClick={() => removeTraveler(traveler.id)}>Remove</button>}
          </div>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Name
            <input type="text" value={traveler.name} onChange={e => updateTraveler(traveler.id, { name: e.target.value })} style={{ display: 'block', width: '100%' }} />
          </label>
          <div style={{ marginBottom: 8 }}>
            <label>Budget max: €{traveler.budget_max}</label>
            <input type="range" min="0" max="200" value={traveler.budget_max} onChange={e => updateTraveler(traveler.id, { budget_max: Number(e.target.value) })} style={{ display: 'block', width: '100%' }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <p style={{ marginBottom: 4 }}>Preferred categories</p>
            {CATEGORIES.map(cat => (
              <label key={cat} style={{ marginRight: 12 }}>
                <input type="checkbox" checked={traveler.preferred_categories.includes(cat)} onChange={() => toggleListValue(traveler.id, 'preferred_categories', cat)} /> {cat}
              </label>
            ))}
          </div>
          <div style={{ marginBottom: 8 }}>
            <p style={{ marginBottom: 4 }}>Hard requirements (vetoes)</p>
            {VETOES.map(v => (
              <label key={v.id} style={{ display: 'block' }}>
                <input type="checkbox" checked={traveler.vetoes.includes(v.id)} onChange={() => toggleListValue(traveler.id, 'vetoes', v.id)} /> {v.label}
              </label>
            ))}
          </div>
          <label>
            Pace
            <select value={traveler.pace} onChange={e => updateTraveler(traveler.id, { pace: e.target.value })} style={{ display: 'block' }}>
              {PACES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        </div>
      ))}

      {travelers.length < 4 && <button onClick={addTraveler} style={{ marginRight: 12 }}>+ Add traveler</button>}

      <button onClick={generate} disabled={loading}>
        {loading ? 'Generating…' : 'Generate'}
        {loading && <span style={{ display: 'inline-block', width: 12, height: 12, marginLeft: 8, border: '2px solid #ccc', borderTopColor: '#333', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
      </button>

      {apiError && <div style={{ background: '#fdeaea', color: '#a33', padding: 12, marginTop: 16, borderRadius: 6 }}>{apiError}</div>}

    <div style={{ marginTop: 24 }}>
        <button onClick={() => onResults({ itineraries: SAMPLE_ITINERARIES, stats: SAMPLE_STATS, travelers })}>
          Preview results (sample data)
        </button>
        <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>Debug only — shows the Results page without needing a live backend</span>
      </div>
      <p style={{ fontSize: 13, color: '#888', marginTop: 24, marginBottom: 4 }}>Debug: current state</p>
      <pre style={{ background: '#f5f5f5', padding: 12, overflowX: 'auto' }}>{JSON.stringify(travelers, null, 2)}</pre>
    </div>
  )
}