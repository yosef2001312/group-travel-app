import { useState } from 'react'

export default function CreateGroupPage({ onCreated, onBack }) {
  const [expectedTravelers, setExpectedTravelers] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [createdGroupId, setCreatedGroupId] = useState(null)

  async function createGroup() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:8000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expected_travelers: expectedTravelers }),
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
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>Group created</h1>
        <p>Share this code with your group:</p>
        <p style={{ fontSize: 32, fontWeight: 'bold', letterSpacing: 2 }}>{createdGroupId}</p>
        <button onClick={() => onCreated(createdGroupId)}>Continue to my own preferences</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Create a group</h1>
      <label style={{ display: 'block', margin: '24px 0' }}>
        How many travelers in total?
        <input
          type="number" min="1" max="10" value={expectedTravelers}
          onChange={e => setExpectedTravelers(Number(e.target.value))}
          style={{ display: 'block', margin: '8px auto', width: 80, textAlign: 'center', fontSize: 18 }}
        />
      </label>
      <button onClick={createGroup} disabled={loading}>{loading ? 'Creating…' : 'Create group'}</button>
      <div style={{ marginTop: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}>← Back</button>
      </div>
      {error && <div style={{ background: '#fdeaea', color: '#a33', padding: 12, marginTop: 16, borderRadius: 6 }}>{error}</div>}
    </div>
  )
}