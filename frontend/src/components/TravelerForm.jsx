import { useState } from 'react'

const CATEGORIES = [
  { id: 'culture', emoji: '🏛️' },
  { id: 'food', emoji: '🍜' },
  { id: 'nature', emoji: '🌿' },
  { id: 'nightlife', emoji: '🌙' },
  { id: 'adventure', emoji: '🪂' },
]
const VETOES = [
  { id: 'vegan', label: 'Vegan food only', sub: 'Only include vegan-friendly food activities', emoji: '🥗' },
  { id: 'no_stairs', label: 'Step-free access', sub: 'Skip anything that requires stairs or climbing', emoji: '♿' },
  { id: 'no_flights', label: 'No flights', sub: 'Ground transportation only', emoji: '🚆' },
]
const PACES = [
  { id: 'morning', emoji: '🌅' },
  { id: 'flexible', emoji: '🕐' },
  { id: 'evening', emoji: '🌆' },
]

const INTEREST_THRESHOLD = 6

function makeTravelerId() {
  return 't-' + Math.random().toString(36).slice(2, 8)
}

export default function TravelerForm({ groupId, onJoined }) {
  const [name, setName] = useState('')
  const [budget, setBudget] = useState(100)
  const [interests, setInterests] = useState(
    Object.fromEntries(CATEGORIES.map(c => [c.id, 5]))
  )
  const [vetoes, setVetoes] = useState([])
  const [pace, setPace] = useState('flexible')
  const [travelerId] = useState(makeTravelerId())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function toggleVeto(id) {
    setVetoes(vetoes.includes(id) ? vetoes.filter(v => v !== id) : [...vetoes, id])
  }

  async function submitJoin() {
    setLoading(true)
    setError(null)

    // Translate rich inputs into the exact shape the backend already expects
    const traveler = {
      id: travelerId,
      name,
      budget_max: budget,
      preferred_categories: CATEGORIES
        .filter(c => interests[c.id] >= INTEREST_THRESHOLD)
        .map(c => c.id),
      vetoes,
      pace,
    }

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
    <div className="page fade-up">
      <div className="page-center">
        <div className="steps">
          <div className="step-dot done" />
          <div className="step-dot active" />
          <div className="step-dot" />
          <div className="step-dot" />
        </div>
        <p className="eyebrow">Your preferences</p>
        <h1>Make it yours</h1>
        <p className="subtitle">Group <span className="mono">{groupId}</span> · Slide, toggle, and tune — the group's packages are built around everyone's answers.</p>
      </div>

      <div className="card">
        <div className="field">
          <label>Your name</label>
          <input type="text" value={name} placeholder="e.g. Dana" onChange={e => setName(e.target.value)} />
        </div>

        <div className="field">
          <label>My budget ceiling</label>
          <div className="budget-value">€{budget}</div>
          <input type="range" min="0" max="200" step="5" value={budget} onChange={e => setBudget(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--route-bright)' }} />
          <p className="interest-hint">The absolute most you'd spend — packages above this won't be offered to your group.</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <span className="field-label">How much do these interest you?</span>
        <p className="interest-hint" style={{ marginBottom: 16 }}>Rate each from 1 to 10 — anything you rate {INTEREST_THRESHOLD}+ counts as a favorite.</p>
        {CATEGORIES.map(c => (
          <div key={c.id} className="interest-row">
            <div className="interest-head">
              <span className="interest-name"><span className="interest-emoji">{c.emoji}</span>{c.id}</span>
              <span className={`interest-value ${interests[c.id] >= INTEREST_THRESHOLD ? 'hot' : ''}`}>
                {interests[c.id]}/10{interests[c.id] >= INTEREST_THRESHOLD ? ' · favorite' : ''}
              </span>
            </div>
            <input
              type="range" min="1" max="10" value={interests[c.id]}
              onChange={e => setInterests({ ...interests, [c.id]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <span className="field-label">Non-negotiables</span>
        <p className="interest-hint" style={{ marginBottom: 14 }}>These are hard requirements — the trip must respect them, no exceptions.</p>
        {VETOES.map(v => (
          <div key={v.id} className={`req-toggle ${vetoes.includes(v.id) ? 'on' : ''}`} onClick={() => toggleVeto(v.id)}>
            <span className="req-label">
              <span style={{ fontSize: 18 }}>{v.emoji}</span>
              <span>
                {v.label}
                <span className="req-sub">{v.sub}</span>
              </span>
            </span>
            <span className="switch" />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <span className="field-label">Your ideal pace</span>
        <div className="pace-row" style={{ marginTop: 10 }}>
          {PACES.map(p => (
            <div key={p.id} className={`pace-pill ${pace === p.id ? 'on' : ''}`} onClick={() => setPace(p.id)}>
              <span className="pace-emoji">{p.emoji}</span>
              {p.id}
            </div>
          ))}
        </div>
      </div>

      <div className="page-center" style={{ marginTop: 24 }}>
        <button className="btn" onClick={submitJoin} disabled={loading || !name}>
          {loading && <span className="spinner" />} {loading ? 'Joining…' : 'Submit my preferences'}
        </button>
        {error && <div className="error-box" style={{ display: 'inline-block' }}>{error}</div>}
      </div>
    </div>
  )
}