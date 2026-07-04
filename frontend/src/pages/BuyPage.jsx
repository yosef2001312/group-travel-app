import { useState } from 'react'
import ItineraryCard from '../components/ItineraryCard'

export default function BuyPage({ groupId, myTravelerId, chosenPackage, travelerNames, onPurchased }) {
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState(null)

  async function buy() {
    setBuying(true)
    setError(null)
    try {
      const myName = travelerNames[myTravelerId] || 'Traveler'
      const res = await fetch('http://localhost:8000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: chosenPackage.package_id,
          trip_id: groupId,
          traveler_names: [myName],
          payment_method: 'credit_card',
        }),
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
      console.log('Checkout response:', data)
      onPurchased(data.order_id)
    } catch (err) {
      setError('Purchase failed: ' + err.message)
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="page page-center">
      <p className="eyebrow">Checkout</p>
      <h1>Buy your ticket</h1>
      <p className="subtitle">This is the package the group decided on — here's exactly what's included.</p>

      {chosenPackage ? (
        <>
          <div style={{ display: 'inline-block' }}>
            <ItineraryCard itinerary={chosenPackage} travelerNames={travelerNames} />
          </div>
          <p className="debug-text" style={{ marginTop: 12 }}>
            This price is per person — everyone in the group pays it individually.
          </p>
        </>
      ) : (
        <p className="subtitle">Loading package details…</p>
      )}

      <div style={{ marginTop: 8 }}>
        <button className="btn" onClick={buy} disabled={buying || !chosenPackage}>
          {buying && <span className="spinner" />}{' '}
          {buying
            ? 'Processing…'
            : chosenPackage
              ? `Buy my ticket — ${chosenPackage.currency} ${chosenPackage.total_price}`
              : 'Buy my ticket'}
        </button>
      </div>

      {error && <div className="error-box" style={{ display: 'inline-block' }}>{error}</div>}
    </div>
  )
}