export default function ConfirmationPage({ orderId, chosenPackage, onBackToStart }) {
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
      <button className="btn" onClick={onBackToStart} style={{ marginTop: 28 }}>Plan another trip</button>
    </div>
  )
}