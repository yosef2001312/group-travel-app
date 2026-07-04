export default function ConfirmationPage({ orderId, onBackToStart }) {
  return (
    <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 48 }}>✅</div>
      <h1>Booking confirmed</h1>
      <p style={{ color: '#666' }}>Your trip package has been booked.</p>
      <p style={{ marginTop: 16 }}>
        Order ID: <strong>{orderId}</strong>
      </p>
      <button onClick={onBackToStart} style={{ marginTop: 24 }}>
        Plan another trip
      </button>
    </div>
  )
}