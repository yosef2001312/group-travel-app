import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'

const getColor = (d) => {
  if (d.criterion === 'utilitarian') return '#3B8BD4'
  if (d.criterion === 'leximin') return '#1D9E75'
  if (d.criterion === 'majority') return '#D85A30'
  if (d.isPareto) return '#7F77DD'
  return '#B4B2A9'
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: 'white', border: '1px solid #ccc', borderRadius: 6, padding: 8, fontSize: 12 }}>
      <div>Cost: €{d.x}</div>
      <div>Group score: {d.y.toFixed(3)}</div>
      {d.criterion && <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{d.criterion}</div>}
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}

export default function ParetoChart({ frontier }) {
  if (!frontier || frontier.length === 0) return null

  const chartData = frontier.map(c => ({
    x: c.total_cost,
    y: c.group_score,
    isPareto: c.is_pareto,
    criterion: c.fairness_criterion,
  }))

  return (
    <div style={{ marginTop: 32 }}>
      <h3>Trade-off map</h3>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
        Every combination the algorithm considered. Purple = genuine trade-off. Gray = ruled out. Colored = one of the packages above.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name="Total cost" unit="€" />
          <YAxis type="number" dataKey="y" name="Group score" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={chartData}>
            {chartData.map((d, i) => <Cell key={i} fill={getColor(d)} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#666', marginTop: 8, flexWrap: 'wrap' }}>
        <LegendDot color="#3B8BD4" label="Utilitarian" />
        <LegendDot color="#1D9E75" label="Leximin" />
        <LegendDot color="#D85A30" label="Majority" />
        <LegendDot color="#7F77DD" label="Other Pareto-optimal" />
        <LegendDot color="#B4B2A9" label="Dominated" />
      </div>
    </div>
  )
}