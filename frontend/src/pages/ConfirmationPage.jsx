import { useState } from 'react'

export default function ConfirmationPage({ orderId, chosenPackage, groupId, onBackToStart }) {
  const [hotel, setHotel] = useState(null)
  const [loadingHotel, setLoadingHotel] = useState(false)
  const [hotelError, setHotelError] = useState(null)

  async function suggestHotel() {
    setLoadingHotel(true)
    setHotelError(null)
    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}/suggest-hotel`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail?.message || JSON.stringify(err?.detail) || `Server responded with ${res.status}`)
      }
      const data = await res.json()
      console.log('Hotel suggestion:', data)
      setHotel(data)
    } catch (err) {
      setHotelError('Could not get a suggestion: ' + err.message)
    } finally {
      setLoadingHotel(false)
    }
  }

  return (
    <div className="page page-center">
      <p className="eyebrow">Booking confirmed</p>
      <div className="ticket" style={{ margin: '0 auto', maxWidth: 300 }}>
        <div className="ticket-stub">
          <span className="stamp">confirmed</span>
          {chosenPackage && <div className="package-title">{chosenPackage.title}</div>}
        </div>
        <div className="ticket-tear" />
        <div className="ticket-body" style={{ textAlign: 'center' }}>
          {chosenPackage && (
            <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>
              {chosenPackage.currency} {chosenPackage.total_price}
            </p>
          )}
          <p className="subtitle" style={{ margin: '16px 0 4px' }}>Confirmation code</p>
          <div className="order-code">{orderId}</div>
        </div>
      </div>

      {!hotel ? (
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={suggestHotel} disabled={loadingHotel}>
            {loadingHotel && <span className="spinner spinner-dark" />} {loadingHotel ? 'Thinking…' : 'Suggest a hotel area'}
          </button>
          {hotelError && <div className="error-box" style={{ display: 'inline-block' }}>{hotelError}</div>}
        </div>
      ) : (
        <div className="card" style={{ marginTop: 24, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--route)', margin: '0 0 8px' }}>
            Stay near {hotel.city}
          </p>
          <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.5 }}>{hotel.suggestion}</p>
          <a href={hotel.booking_link} target="_blank" rel="noopener noreferrer" className="btn btn-block" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            Search hotels in {hotel.city}
          </a>
        </div>
      )}

      <button className="btn" onClick={onBackToStart} style={{ marginTop: 28 }}>Plan another trip</button>
    </div>
  )
}