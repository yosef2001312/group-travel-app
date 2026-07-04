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
    <div className="page page-wide fade-up">
      <div className="page-center">
        <div className="steps">
          <div className="step-dot done" />
          <div className="step-dot done" />
          <div className="step-dot done" />
          <div className="step-dot active" />
        </div>

        <p className="eyebrow">Vote</p>
        <h1>Pick your favorite package</h1>
        {stats && (
          <p className="debug-text">
            {stats.total_activities} activities → {stats.after_filter} after filter → {stats.candidates_generated} candidates → {stats.pareto_frontier_size} on frontier → {stats.itineraries_selected} selected
          </p>
        )}
      </div>

      <div className="cards-row">
        {itineraries.map((it, i) => (
          <ItineraryCard key={it.package_id || i} itinerary={it} travelerNames={travelerNames} />
        ))}
      </div>

      {!voted ? (
        <div className="card" style={{ marginTop: 28, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          <h3>Cast your vote</h3>
          <div className="radio-row block">
            {itineraries.map(it => (
              <label key={it.package_id}>
                <input
                  type="radio" name="my-vote"
                  checked={choice === it.fairness_criterion}
                  onChange={() => setChoice(it.fairness_criterion)}
                />
                <span style={{ textTransform: 'capitalize' }}>{it.fairness_criterion}</span> — {it.title}
              </label>
            ))}
          </div>
          <button className="btn btn-block" onClick={submitVote} disabled={!choice || submitting} style={{ marginTop: 8 }}>
            {submitting && <span className="spinner" />} {submitting ? 'Submitting…' : 'Submit my vote'}
          </button>
          {error && <div className="error-box">{error}</div>}
        </div>
      ) : isAdmin ? (
        <div className="success-box" style={{ maxWidth: 420, margin: '28px auto 0', textAlign: 'center', padding: 20 }}>
          <p>Your vote is in! As the group admin, you can review everyone's votes and choose the final package whenever you're ready.</p>
          <button className="btn" onClick={onGoToAdminReview} style={{ marginTop: 8 }}>Go to admin review</button>
        </div>
      ) : !groupDecided ? (
        <div className="success-box" style={{ maxWidth: 420, margin: '28px auto 0', textAlign: 'center', padding: 20 }}>
          <p>Your vote is in! Waiting for the group admin to review everyone's votes and pick the final package.</p>
          <button className="btn btn-secondary" onClick={checkDecision} disabled={checkingDecision} style={{ marginTop: 8 }}>
            {checkingDecision && <span className="spinner spinner-dark" />} {checkingDecision ? 'Checking…' : 'Check again'}
          </button>
        </div>
      ) : (
        <div className="success-box" style={{ maxWidth: 420, margin: '28px auto 0', textAlign: 'center', padding: 20 }}>
          <p>The admin has decided! Chosen package: <strong>{decidedPackageId}</strong></p>
          <button className="btn" onClick={() => onDecided(decidedPackageId)} style={{ marginTop: 8 }}>Go to buy page</button>
        </div>
      )}
    </div>
  )
}