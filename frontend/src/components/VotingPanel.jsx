import { useState } from 'react'

export default function VotingPanel({ tripId, travelers, criteria }) {
  const [votes, setVotes] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [tally, setTally] = useState(null)
  const [error, setError] = useState(null)

  function setVote(travelerId, criterion) {
    setVotes({ ...votes, [travelerId]: criterion })
  }

  async function submitVotes() {
    setSubmitting(true)
    setError(null)
    setTally(null)
    try {
      for (const t of travelers) {
        const chosen = votes[t.id]
        if (!chosen) continue

        const params = new URLSearchParams({
          trip_id: tripId,
          traveler_id: t.id,
          chosen_criterion: chosen,
          num_travelers: travelers.length,
        })

        const res = await fetch(`http://localhost:8000/api/vote?${params}`, { method: 'POST' })

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(`Vote failed for ${t.name || t.id}: ${JSON.stringify(err?.detail || res.status)}`)
        }
      }

      const tallyRes = await fetch(`http://localhost:8000/api/votes/${tripId}`)
      const tallyData = await tallyRes.json()
      console.log('Tally response:', tallyData)
      setTally(tallyData)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const allVoted = travelers.length > 0 && travelers.every(t => votes[t.id])

  return (
    <div style={{ marginTop: 32, border: '1px solid #ccc', borderRadius: 8, padding: 16 }}>
      <h3>Cast your votes</h3>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
        One screen, one at a time — pick each traveler's favorite package.
      </p>

      {travelers.map(t => (
        <div key={t.id} style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{t.name || t.id}</div>
          {criteria.map(c => (
            <label key={c} style={{ marginRight: 16, textTransform: 'capitalize' }}>
              <input
                type="radio"
                name={`vote-${t.id}`}
                checked={votes[t.id] === c}
                onChange={() => setVote(t.id, c)}
              />{' '}
              {c}
            </label>
          ))}
        </div>
      ))}

      <button onClick={submitVotes} disabled={!allVoted || submitting}>
        {submitting ? 'Submitting…' : 'Submit votes'}
      </button>

      {error && (
        <div style={{ background: '#fdeaea', color: '#a33', padding: 12, marginTop: 12, borderRadius: 6 }}>
          {error}
        </div>
      )}

      {tally && (
        <div style={{ marginTop: 16, background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>Raw response: {JSON.stringify(tally)}</div>
        </div>
      )}
    </div>
  )
}