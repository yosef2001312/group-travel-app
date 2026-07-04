import { useState } from 'react'

export default function JoinGroupPage({ onJoined, onBack }) {
  const [code, setCode] = useState('')

  return (
    <div className="page page-center">
      <p className="eyebrow">Join group</p>
      <h1>Join a group</h1>
      <p className="subtitle">Enter the code someone shared with you.</p>
      <div className="card" style={{ display: 'inline-block', minWidth: 260 }}>
        <div className="field" style={{ textAlign: 'center' }}>
          <label>Group code</label>
          <input
            type="text" value={code} onChange={e => setCode(e.target.value.trim())}
            placeholder="e.g. GRP-A1B2"
            className="mono"
            style={{ textAlign: 'center', fontSize: 18, letterSpacing: '0.05em' }}
          />
        </div>
        <button className="btn btn-block" onClick={() => code && onJoined(code)} disabled={!code}>Continue</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back</button>
      </div>
    </div>
  )
}