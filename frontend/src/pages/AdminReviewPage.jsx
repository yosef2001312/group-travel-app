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
      <div className="page page-center">
        <p className="eyebrow">Decision made</p>
        <h1>You picked</h1>
        <p style={{ fontSize: 18, fontWeight: 700 }}>{chosen ? chosen.title : finalized}</p>
        <button className="btn" onClick={() => onDecided(finalized)} style={{ marginTop: 20 }}>Go to buy page</button>
      </div>
    )
  }

  return (
    <div className="page page-wide">
      <div className="page-center">
        <p className="eyebrow">Admin review</p>
        <h1>Review the votes</h1>
        <button className="btn btn-secondary" onClick={checkVotes} disabled={loading}>
          {loading && <span className="spinner spinner-dark" />} {loading ? 'Checking…' : 'Check votes'}
        </button>

        {group && <p style={{ marginTop: 16 }}>{votesIn} of {totalVoters} travelers have voted.</p>}

        {group && Object.keys(votes).length > 0 && (
          <div className="card" style={{ marginTop: 16, display: 'inline-block', textAlign: 'left' }}>
            {Object.entries(votes).map(([travelerId, criterion]) => (
              <div key={travelerId} style={{ fontSize: 14, marginBottom: 4 }}>
                {travelerNames[travelerId] || travelerId} voted <strong style={{ textTransform: 'capitalize' }}>{criterion}</strong>
              </div>
            ))}
          </div>
        )}

        {error && <div className="error-box" style={{ display: 'inline-block' }}>{error}</div>}
      </div>

      <h3 style={{ marginTop: 36, textAlign: 'center' }}>Pick the final package</h3>
      <p className="subtitle" style={{ textAlign: 'center' }}>You can follow the votes above, or override with your own call.</p>
      <div className="cards-row">
        {results.itineraries.map(it => (
          <div key={it.package_id} className="decision-card">
            <span className="stamp">{it.fairness_criterion}</span>
            <div style={{ fontWeight: 700, fontSize: 14, margin: '8px 0' }}>{it.title}</div>
            <div className="subtitle" style={{ marginBottom: 12 }}>
              {tally[it.fairness_criterion] || 0} vote{(tally[it.fairness_criterion] || 0) === 1 ? '' : 's'}
            </div>
            <button className="btn btn-block" onClick={() => finalize(it.package_id)} disabled={finalizing}>
              {finalizing ? 'Choosing…' : 'Choose this one'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}