export default function ConfirmationPage({ orderId, chosenPackage, onBackToStart }) {
  return (
    <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 48 }}>✅</div>
      <h1>Booking confirmed</h1>
      {chosenPackage && (
        <p style={{ color: '#666' }}>
          {chosenPackage.title} — {chosenPackage.currency} {chosenPackage.total_price}
        </p>
      )}
      <p style={{ marginTop: 16 }}>
        Order ID: <strong>{orderId}</strong>
      </p>
      <button onClick={onBackToStart} style={{ marginTop: 24 }}>
        Plan another trip
      </button>
    </div>
  )
}