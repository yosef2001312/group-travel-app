import { useState } from 'react'
import TravelerForm from './components/TravelerForm'
import ResultsPage from './pages/ResultsPage'

function App() {
  const [page, setPage] = useState('form')

  return (
    <div>
      <div style={{ textAlign: 'center', padding: 12, background: '#f5f5f5' }}>
        <button onClick={() => setPage('form')} disabled={page === 'form'}>
          Preferences
        </button>
        <button onClick={() => setPage('results')} disabled={page === 'results'} style={{ marginLeft: 8 }}>
          Results (mock)
        </button>
      </div>
      {page === 'form' ? <TravelerForm /> : <ResultsPage />}
    </div>
  )
}

export default App