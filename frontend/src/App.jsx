import { useState } from 'react'
import TravelerForm from './components/TravelerForm'
import ResultsPage from './pages/ResultsPage'
import ConfirmationPage from './pages/ConfirmationPage'

function App() {
  const [page, setPage] = useState('form')
  const [results, setResults] = useState(null)
  const [tripId, setTripId] = useState(null)
  const [orderId, setOrderId] = useState(null)

  function handleResults(data) {
    setResults(data)
    setTripId('trip-' + Date.now()) // placeholder — confirm with B if the server should issue this instead
    setPage('results')
  }

  function handlePurchased(id) {
    setOrderId(id)
    setPage('confirmation')
  }

  function backToStart() {
    setResults(null)
    setTripId(null)
    setOrderId(null)
    setPage('form')
  }

  return (
    <div>
      {page === 'form' && <TravelerForm onResults={handleResults} />}
      {page === 'results' && results && (
        <ResultsPage
          itineraries={results.itineraries}
          stats={results.stats}
          tripId={tripId}
          travelerNames={(results.travelers || []).map(t => t.name).filter(Boolean)}
          onBack={() => setPage('form')}
          onPurchased={handlePurchased}
        />
      )}
      {page === 'confirmation' && (
        <ConfirmationPage orderId={orderId} onBackToStart={backToStart} />
      )}
    </div>
  )
}

export default App