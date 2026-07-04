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
    <div className="page page-center fade-up">
      <div className="steps">
        <div className="step-dot done" />
        <div className="step-dot done" />
        <div className="step-dot active" />
        <div className="step-dot" />
      </div>

      <p className="eyebrow">Waiting room</p>
      <h1>Hang tight</h1>
      <p className="subtitle" style={{ marginBottom: 8 }}>Group: <span className="mono">{groupId}</span></p>

      <button className="btn btn-secondary" onClick={checkStatus} disabled={loading}>
        {loading && <span className="spinner spinner-dark" />} {loading ? 'Checking…' : 'Check for updates'}
      </button>

      {group && <p style={{ marginTop: 20, fontSize: 16 }}>{joined} of {expected} travelers have joined.</p>}
      {error && <div className="error-box">{error}</div>}

      {group && ready && isAdmin && (
        <div className="card" style={{ marginTop: 24, display: 'inline-block' }}>
          <p style={{ color: 'var(--route)', fontWeight: 700, margin: '0 0 12px' }}>Everyone's in — you can generate the packages.</p>
          <button className="btn btn-block" onClick={generate} disabled={generating}>
            {generating && <span className="spinner" />} {generating ? 'Generating…' : 'Generate packages'}
          </button>
        </div>
      )}

      {group && ready && !isAdmin && (
        <p className="subtitle" style={{ marginTop: 24 }}>Everyone's in. Waiting for the group admin to generate the packages — check back soon.</p>
      )}

      {group && !ready && (
        <p className="subtitle" style={{ marginTop: 24 }}>
          Still waiting on {expected - joined} more traveler{expected - joined === 1 ? '' : 's'}.
        </p>
      )}
    </div>
  )
}