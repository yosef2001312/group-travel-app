export default function LandingPage({ onChoose }) {
  return (
    <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Group trip planner</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Plan a trip together — everyone joins from their own device.</p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <button onClick={() => onChoose('create')} style={{ padding: '12px 24px', fontSize: 16 }}>Create a group</button>
        <button onClick={() => onChoose('join')} style={{ padding: '12px 24px', fontSize: 16 }}>Join a group</button>
      </div>
    </div>
  )
}