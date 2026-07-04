import { useState } from 'react'

const CATEGORIES = ['culture', 'food', 'nature', 'nightlife', 'adventure']
const VETOES = [
  { id: 'vegan', label: 'Vegan food only' },
  { id: 'no_stairs', label: 'No stairs / step-free access' },
  { id: 'no_flights', label: 'No flights' },
]
const PACES = ['morning', 'flexible', 'evening']

function makeTravelerId() {
  return 't-' + Math.random().toString(36).slice(2, 8)
}

export default function TravelerForm({ groupId, onJoined }) {
  const [traveler, setTraveler] = useState({
    id: makeTravelerId(), name: '', budget_max: 100,
    preferred_categories: [], vetoes: [], pace: 'flexible',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function update(changes) {
    setTraveler({ ...traveler, ...changes })
  }

  function toggleListValue(field, value) {
    const current = traveler[field]
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    update({ [field]: next })
  }

  async function submitJoin() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(traveler),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail?.message || JSON.stringify(err?.detail) || `Server responded with ${res.status}`)
      }
      const data = await res.json()
      console.log('Join response:', data)
      onJoined(data, traveler)
    } catch (err) {
      setError('Could not reach the backend — is it running yet? (' + err.message + ')')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Your preferences</h1>
      <p style={{ fontSize: 13, color: '#888' }}>Group: {groupId}</p>

      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Name
          <input type="text" value={traveler.name} onChange={e => update({ name: e.target.value })} style={{ display: 'block', width: '100%' }} />
        </label>

        <div style={{ marginBottom: 8 }}>
          <label>Budget max: €{traveler.budget_max}</label>
          <input type="range" min="0" max="200" value={traveler.budget_max} onChange={e => update({ budget_max: Number(e.target.value) })} style={{ display: 'block', width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <p style={{ marginBottom: 4 }}>Preferred categories</p>
          {CATEGORIES.map(cat => (
            <label key={cat} style={{ marginRight: 12 }}>
              <input type="checkbox" checked={traveler.preferred_categories.includes(cat)} onChange={() => toggleListValue('preferred_categories', cat)} /> {cat}
            </label>
          ))}
        </div>

        <div style={{ marginBottom: 8 }}>
          <p style={{ marginBottom: 4 }}>Hard requirements (vetoes)</p>
          {VETOES.map(v => (
            <label key={v.id} style={{ display: 'block' }}>
              <input type="checkbox" checked={traveler.vetoes.includes(v.id)} onChange={() => toggleListValue('vetoes', v.id)} /> {v.label}
            </label>
          ))}
        </div>

        <label>
          Pace
          <select value={traveler.pace} onChange={e => update({ pace: e.target.value })} style={{ display: 'block' }}>
            {PACES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <button onClick={submitJoin} disabled={loading || !traveler.name} style={{ marginTop: 16 }}>
        {loading ? 'Joining…' : 'Submit my preferences'}
      </button>

      {error && <div style={{ background: '#fdeaea', color: '#a33', padding: 12, marginTop: 16, borderRadius: 6 }}>{error}</div>}
    </div>
  )
}