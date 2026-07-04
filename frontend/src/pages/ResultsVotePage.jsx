import { useState } from 'react'
import ItineraryCard from '../components/ItineraryCard'

export default function ResultsVotePage({ groupId, myTravelerId, results, travelerNames, isAdmin, onGoToAdminReview, onDecided }) {
  const { itineraries, stats } = results
  const [choice, setChoice] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [voted, setVoted] = useState(false)
  const [error, setError] = useState(null)

  const [checkingDecision, setCheckingDecision] = useState(false)
  const [groupDecided, setGroupDecided] = useState(false)
  const [decidedPackageId, setDecidedPackageId] = useState(null)

  async function submitVote() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traveler_id: myTravelerId, chosen_criterion: choice }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail?.message || JSON.stringify(err?.detail) || `Server responded with ${res.status}`)
      }
      setVoted(true)
    } catch (err) {
      setError('Vote failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function checkDecision() {
    setCheckingDecision(true)
    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}`)
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      console.log('Group status:', data)
      if (data.status === 'decided' && data.final_package_id) {
        setGroupDecided(true)
        setDecidedPackageId(data.final_package_id)
      }
    } catch (err) {
      console.error('Check failed:', err)
    } finally {
      setCheckingDecision(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Vote for your favorite package</h1>
      {stats && (
        <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
          Debug: {stats.total_activities} activities → {stats.after_filter} after filter → {stats.candidates_generated} candidates → {stats.pareto_frontier_size} on frontier → {stats.itineraries_selected} selected
        </p>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {itineraries.map((it, i) => (
          <ItineraryCard key={it.package_id || i} itinerary={it} travelerNames={travelerNames} />
        ))}
      </div>

      {!voted ? (
        <div style={{ marginTop: 32, border: '1px solid #ccc', borderRadius: 8, padding: 16 }}>
          <h3>Cast your vote</h3>
          {itineraries.map(it => (
            <label key={it.package_id} style={{ display: 'block', marginBottom: 8, textTransform: 'capitalize' }}>
              <input
                type="radio" name="my-vote"
                checked={choice === it.fairness_criterion}
                onChange={() => setChoice(it.fairness_criterion)}
              />{' '}
              {it.fairness_criterion} — {it.title}
            </label>
          ))}
          <button onClick={submitVote} disabled={!choice || submitting} style={{ marginTop: 8 }}>
            {submitting ? 'Submitting…' : 'Submit my vote'}
          </button>
          {error && <div style={{ background: '#fdeaea', color: '#a33', padding: 12, marginTop: 12, borderRadius: 6 }}>{error}</div>}
        </div>
      ) : isAdmin ? (
        <div style={{ marginTop: 32, background: '#eef8f2', color: '#1D9E75', padding: 16, borderRadius: 8 }}>
          <p>Your vote is in! As the group admin, you can review everyone's votes and choose the final package whenever you're ready.</p>
          <button onClick={onGoToAdminReview} style={{ marginTop: 8 }}>Go to admin review</button>
        </div>
      ) : !groupDecided ? (
        <div style={{ marginTop: 32, background: '#eef8f2', color: '#1D9E75', padding: 16, borderRadius: 8 }}>
          <p>Your vote is in! Waiting for the group admin to review everyone's votes and pick the final package.</p>
          <button onClick={checkDecision} disabled={checkingDecision} style={{ marginTop: 8 }}>
            {checkingDecision ? 'Checking…' : 'Check again'}
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 32, background: '#eef8f2', color: '#1D9E75', padding: 16, borderRadius: 8 }}>
          <p>The admin has decided! Chosen package: <strong>{decidedPackageId}</strong></p>
          <button onClick={() => onDecided(decidedPackageId)} style={{ marginTop: 8 }}>Go to buy page</button>
        </div>
      )}
    </div>
  )
}