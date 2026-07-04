import { useState } from 'react'

export default function JoinGroupPage({ onJoined, onBack }) {
  const [code, setCode] = useState('')

  return (
    <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Join a group</h1>
      <label style={{ display: 'block', margin: '24px 0' }}>
        Enter the group code
        <input
          type="text" value={code} onChange={e => setCode(e.target.value.trim())}
          placeholder="e.g. GRP-A1B2"
          style={{ display: 'block', margin: '8px auto', width: 200, textAlign: 'center', fontSize: 18 }}
        />
      </label>
      <button onClick={() => code && onJoined(code)} disabled={!code}>Continue</button>
      <div style={{ marginTop: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}>← Back</button>
      </div>
    </div>
  )
}