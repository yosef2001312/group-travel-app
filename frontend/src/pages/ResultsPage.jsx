import { useState } from 'react'
import ItineraryCard from '../components/ItineraryCard'
import ParetoChart from '../components/ParetoChart'
import VotingPanel from '../components/VotingPanel'

export default function ResultsPage({ itineraries, stats, frontier, tripId, travelers, onBack, onPurchased }) {
  const [buyingId, setBuyingId] = useState(null)
  const [checkoutError, setCheckoutError] = useState(null)

  const travelerNames = (travelers || []).map(t => t.name).filter(Boolean)
  const criteria = itineraries.map(it => it.fairness_criterion)

  async function handleBuy(packageId) {
    setBuyingId(packageId)
    setCheckoutError(null)
    try {
      const res = await fetch('http://localhost:8000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: packageId, trip_id: tripId, traveler_names: travelerNames, payment_method: 'credit_card' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        let message = `Server responded with ${res.status}`
        if (Array.isArray(err?.detail)) message = err.detail.map(d => `${d.loc?.at(-1)}: ${d.msg}`).join(', ')
        else if (typeof err?.detail === 'string') message = err.detail
        else if (err?.detail?.message) message = err.detail.message
        throw new Error(message)
      }
      const data = await res.json()
      onPurchased(data.order_id)
    } catch (err) {
      setCheckoutError(err.message)
    } finally {
      setBuyingId(null)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <button onClick={onBack} style={{ marginBottom: 16 }}>← Back to preferences</button>
      <h1>Your trip packages</h1>
      {stats && (
        <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
          Debug: {stats.total_activities} activities → {stats.after_filter} after filter → {stats.candidates_generated} candidates → {stats.pareto_frontier_size} on frontier → {stats.itineraries_selected} selected
        </p>
      )}

      {checkoutError && <div style={{ background: '#fdeaea', color: '#a33', padding: 12, marginBottom: 16, borderRadius: 6 }}>Checkout failed: {checkoutError}</div>}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {itineraries.map((it, i) => (
          <ItineraryCard key={it.package_id || i} itinerary={it} onBuy={handleBuy} buying={buyingId === it.package_id} />
        ))}
      </div>

      <h1 style={{ color: 'red', background: 'yellow', fontSize: 40 }}>TEST MARKER 999</h1>

      <ParetoChart frontier={frontier} />

      {travelers && travelers.length > 0 && <VotingPanel tripId={tripId} travelers={travelers} criteria={criteria} />}
    </div>
  )
}