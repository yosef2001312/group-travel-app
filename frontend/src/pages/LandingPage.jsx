export default function LandingPage({ onChoose }) {
  return (
    <div className="page page-center fade-up">
        <div className="steps">
  <div className="step-dot active" /><div className="step-dot" /><div className="step-dot" /><div className="step-dot" />
</div>
<p className="eyebrow">Start here</p>
      <h1>Group trip planner</h1>
      <p className="subtitle">Plan a trip together — everyone joins from their own device.</p>
      <div className="btn-row">
        <button className="btn" onClick={() => onChoose('create')}>Create a group</button>
        <button className="btn btn-secondary" onClick={() => onChoose('join')}>Join a group</button>
      </div>
    </div>
  )
}