import { useState } from 'react'

export default function AdminReviewPage({ groupId, results, travelerNames, onDecided }) {
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [finalizing, setFinalizing] = useState(false)
  const [finalized, setFinalized] = useState(null)

  async function checkVotes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}`)
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      console.log('Group status:', data)
      setGroup(data)
    } catch (err) {
      setError('Could not reach the backend — is it running yet? (' + err.message + ')')
    } finally {
      setLoading(false)
    }
  }

  async function finalize(packageId) {
    setFinalizing(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chosen_package_id: packageId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail?.message || JSON.stringify(err?.detail) || `Server responded with ${res.status}`)
      }
      setFinalized(packageId)
    } catch (err) {
      setError('Finalize failed: ' + err.message)
    } finally {
      setFinalizing(false)
    }
  }

  const votes = group ? group.votes : null
  const totalVoters = group ? group.travelers.length : null
  const votesIn = votes ? Object.keys(votes).length : 0

  const tally = {}
  if (votes) {
    Object.values(votes).forEach(c => { tally[c] = (tally[c] || 0) + 1 })
  }

  if (finalized) {
    const chosen = results.itineraries.find(it => it.package_id === finalized)
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>Decision made</h1>
        <p>You picked: <strong>{chosen ? chosen.title : finalized}</strong></p>
        <button onClick={() => onDecided(finalized)} style={{ marginTop: 24 }}>Go to buy page</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Review votes</h1>
      <button onClick={checkVotes} disabled={loading}>{loading ? 'Checking…' : 'Check votes'}</button>

      {group && <p style={{ marginTop: 16 }}>{votesIn} of {totalVoters} travelers have voted.</p>}

      {group && Object.keys(votes).length > 0 && (
        <div style={{ marginTop: 16, textAlign: 'left' }}>
          {Object.entries(votes).map(([travelerId, criterion]) => (
            <div key={travelerId} style={{ fontSize: 14 }}>
              {travelerNames[travelerId] || travelerId} voted <strong style={{ textTransform: 'capitalize' }}>{criterion}</strong>
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ background: '#fdeaea', color: '#a33', padding: 12, marginTop: 16, borderRadius: 6 }}>{error}</div>}

      <h3 style={{ marginTop: 32 }}>Pick the final package</h3>
      <p style={{ fontSize: 13, color: '#888' }}>You can follow the votes above, or override with your own call.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
        {results.itineraries.map(it => (
          <div key={it.package_id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12, width: 200 }}>
            <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{it.fairness_criterion}</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>{it.title}</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
              {tally[it.fairness_criterion] || 0} vote{(tally[it.fairness_criterion] || 0) === 1 ? '' : 's'}
            </div>
            <button onClick={() => finalize(it.package_id)} disabled={finalizing} style={{ width: '100%' }}>
              {finalizing ? 'Choosing…' : 'Choose this one'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}