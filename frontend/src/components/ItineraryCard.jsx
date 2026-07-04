function ItineraryCard({ itinerary, onBuy, buying, travelerNames = {} }) {
  return (
    <div className="ticket">
      <div className="ticket-stub">
        <span className="stamp">{itinerary.fairness_criterion}</span>
        {itinerary.title && <div className="package-title">{itinerary.title}</div>}
      </div>
      <div className="ticket-tear" />
      <div className="ticket-body">
        <div className="description">{itinerary.description}</div>

        {itinerary.activities.map(a => (
          <div key={a.id} className="activity-row">
            <span>{a.name}</span>
            <span className="mono">€{a.cost} · {a.duration_hrs}h</span>
          </div>
        ))}

        <div style={{ marginTop: 10 }}>
          <div className="price-row"><span>Activities</span><span className="mono">€{itinerary.base_cost}</span></div>
          <div className="price-row"><span>Service fee</span><span className="mono">€{itinerary.service_fee}</span></div>
          <div className="price-row total"><span>Total</span><span className="mono">{itinerary.currency} {itinerary.total_price}</span></div>
        </div>

        <div style={{ marginTop: 14 }}>
          {Object.entries(itinerary.per_traveler_score).map(([id, score]) => (
            <div key={id} className="score-row">
              <div className="score-label">
                <span>{travelerNames[id] || id}</span>
                <span className="mono">{Math.round(score * 100)}%</span>
              </div>
              <div className="score-track"><div className="score-fill" style={{ width: `${score * 100}%` }} /></div>
            </div>
          ))}
        </div>

        {onBuy && (
          <button className="btn btn-block" onClick={() => onBuy(itinerary.package_id)} disabled={buying} style={{ marginTop: 14 }}>
            {buying && <span className="spinner" />} {buying ? 'Processing…' : 'Buy this package'}
          </button>
        )}
      </div>
    </div>
  )
}

export default ItineraryCard