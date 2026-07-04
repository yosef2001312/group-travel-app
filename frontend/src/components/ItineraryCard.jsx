const TRAVELER_NAMES = { t1: 'Alex', t2: 'Bella', t3: 'Chris' }

function ItineraryCard({ itinerary, onBuy, buying }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 260 }}>
      <div style={{ fontWeight: 'bold', textTransform: 'capitalize', color: '#3C3489' }}>
        {itinerary.fairness_criterion}
      </div>
      {itinerary.title && (
        <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>{itinerary.title}</div>
      )}
      <div style={{ fontSize: 13, color: '#666', margin: '4px 0 12px' }}>
        {itinerary.description}
      </div>

      {itinerary.activities.map(a => (
        <div
          key={a.id}
          style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #eee' }}
        >
          <span>{a.name}</span>
          <span>€{a.cost} · {a.duration_hrs}h</span>
        </div>
      ))}

      <div style={{ marginTop: 8, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
          <span>Activities</span><span>€{itinerary.base_cost}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
          <span>Service fee</span><span>€{itinerary.service_fee}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: 4 }}>
          <span>Total</span><span>{itinerary.currency} {itinerary.total_price}</span>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {Object.entries(itinerary.per_traveler_score).map(([id, score]) => (
          <div key={id} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>{TRAVELER_NAMES[id] || id}</span>
              <span>{Math.round(score * 100)}%</span>
            </div>
            <div style={{ background: '#eee', borderRadius: 4, height: 6 }}>
              <div style={{ width: `${score * 100}%`, background: '#7F77DD', height: 6, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onBuy(itinerary.package_id)}
        disabled={buying}
        style={{ marginTop: 12, width: '100%' }}
      >
        {buying ? 'Processing…' : 'Buy this package'}
      </button>
    </div>
  )
}

export default ItineraryCard