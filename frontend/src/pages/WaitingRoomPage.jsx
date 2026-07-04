import { useState } from 'react'

export default function WaitingRoomPage({ groupId, isAdmin, onResultsReady }) {
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)

  function extractResults(payload) {
    if (payload && payload.itineraries) return payload
    if (payload && payload.results && payload.results.itineraries) return payload.results
    return null
  }

  async function checkStatus() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}`)
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      console.log('Group status:', data)
      setGroup(data)
      const results = extractResults(data)
      if (results) onResultsReady(results, data.travelers)
    } catch (err) {
      setError('Could not reach the backend — is it running yet? (' + err.message + ')')
    } finally {
      setLoading(false)
    }
  }

  async function generate() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}/generate`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail?.message || JSON.stringify(err?.detail) || `Server responded with ${res.status}`)
      }
      const data = await res.json()
      console.log('Generate response:', data)
      const results = extractResults(data)
      if (results) onResultsReady(results, group ? group.travelers : null)
    } catch (err) {
      setError('Generate failed: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const joined = group ? group.travelers.length : null
  const expected = group ? group.expected_travelers : null
  const ready = group && joined >= expected

  return (
    <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Waiting room</h1>
      <p style={{ fontSize: 13, color: '#888' }}>Group: {groupId}</p>

      <button onClick={checkStatus} disabled={loading} style={{ marginTop: 16 }}>
        {loading ? 'Checking…' : 'Check for updates'}
      </button>

      {group && <p style={{ marginTop: 16 }}>{joined} of {expected} travelers have joined.</p>}
      {error && <div style={{ background: '#fdeaea', color: '#a33', padding: 12, marginTop: 16, borderRadius: 6 }}>{error}</div>}

      {group && ready && isAdmin && (
        <div style={{ marginTop: 24 }}>
          <p style={{ color: '#3C3489', fontWeight: 'bold' }}>Everyone's in — you can generate the packages.</p>
          <button onClick={generate} disabled={generating}>{generating ? 'Generating…' : 'Generate packages'}</button>
        </div>
      )}

      {group && ready && !isAdmin && (
        <p style={{ marginTop: 24, color: '#666' }}>Everyone's in. Waiting for the group admin to generate the packages — check back soon.</p>
      )}

      {group && !ready && (
        <p style={{ marginTop: 24, color: '#666' }}>Still waiting on {expected - joined} more traveler{expected - joined === 1 ? '' : 's'}.</p>
      )}
    </div>
  )
}