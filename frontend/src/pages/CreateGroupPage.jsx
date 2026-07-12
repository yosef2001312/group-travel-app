import { useState, useEffect } from 'react'

export default function CreateGroupPage({ onCreated, onBack }) {
  const [destinations, setDestinations] = useState([])
  const [destination, setDestination] = useState('')
  const [loadingDestinations, setLoadingDestinations] = useState(true)
  const [expectedTravelers, setExpectedTravelers] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [createdGroupId, setCreatedGroupId] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/destinations')
      .then(res => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`)
        return res.json()
      })
      .then(data => {
        setDestinations(data)
        if (data.length > 0) setDestination(data[0])
      })
      .catch(err => setError('Could not load destinations — is the backend running yet? (' + err.message + ')'))
      .finally(() => setLoadingDestinations(false))
  }, [])

  async function createGroup() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:8000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expected_travelers: expectedTravelers, destination }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail?.message || JSON.stringify(err?.detail) || `Server responded with ${res.status}`)
      }
      const data = await res.json()
      setCreatedGroupId(data.group_id)
    } catch (err) {
      setError('Could not reach the backend — is it running yet? (' + err.message + ')')
    } finally {
      setLoading(false)
    }
  }

  if (createdGroupId) {
    return (
      <div className="page page-center">
        <p className="eyebrow">Group created</p>
        <h1>Share this code</h1>
        <div className="group-code">{createdGroupId}</div>
        <div style={{ marginTop: 20 }}>
          <button className="btn" onClick={() => onCreated(createdGroupId)}>Continue to my own preferences</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page page-center">
      <p className="eyebrow">New group</p>
      <h1>Create a group</h1>
      <p className="subtitle">Pick a destination and the number of travelers, then share the code you get.</p>
      <div className="card" style={{ display: 'inline-block', minWidth: 260 }}>
        <div className="field" style={{ textAlign: 'center' }}>
          <label>Destination</label>
          {loadingDestinations ? (
            <p className="subtitle" style={{ margin: 0 }}>Loading destinations…</p>
          ) : (
            <select value={destination} onChange={e => setDestination(e.target.value)}>
              {destinations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </div>
        <div className="field" style={{ textAlign: 'center' }}>
          <label>How many travelers in total?</label>
          <input
            type="number" min="1" max="10" value={expectedTravelers}
            onChange={e => setExpectedTravelers(Number(e.target.value))}
            style={{ textAlign: 'center', fontSize: 20, fontWeight: 700 }}
          />
        </div>
        <button className="btn btn-block" onClick={createGroup} disabled={loading || !destination}>
          {loading && <span className="spinner" />} {loading ? 'Creating…' : 'Create group'}
        </button>
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back</button>
      </div>
      {error && <div className="error-box">{error}</div>}
    </div>
  )
}