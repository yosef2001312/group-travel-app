import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BackgroundScene from './BackgroundScene.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="bg-orbs">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
    <BackgroundScene />
    <div className="app-shell">
      <App />
    </div>
  </StrictMode>,
)