import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import CreateGroupPage from './pages/CreateGroupPage'
import JoinGroupPage from './pages/JoinGroupPage'
import WaitingRoomPage from './pages/WaitingRoomPage'
import ResultsVotePage from './pages/ResultsVotePage'
import AdminReviewPage from './pages/AdminReviewPage'
import BuyPage from './pages/BuyPage'
import ConfirmationPage from './pages/ConfirmationPage'
import TravelerForm from './components/TravelerForm'

function App() {
  const [page, setPage] = useState('landing')
  const [groupId, setGroupId] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [myTravelerId, setMyTravelerId] = useState(null)
  const [results, setResults] = useState(null)
  const [travelerNames, setTravelerNames] = useState({})
  const [finalPackageId, setFinalPackageId] = useState(null)
  const [myOrderId, setMyOrderId] = useState(null)

  function handleCreated(newGroupId) {
    setGroupId(newGroupId)
    setPage('form')
  }

  function handleJoined(result, traveler) {
    setIsAdmin(result.is_admin)
    setMyTravelerId(traveler.id)
    setPage('waiting')
  }

  function handleResultsReady(newResults, travelers) {
    setResults(newResults)
    if (travelers) {
      const names = {}
      travelers.forEach(t => { names[t.id] = t.name })
      setTravelerNames(names)
    }
    setPage('vote')
  }

  function handleDecided(packageId) {
    setFinalPackageId(packageId)
    setPage('buy')
  }

  function handlePurchased(orderId) {
    setMyOrderId(orderId)
    setPage('confirmation')
  }

  function backToStart() {
    setPage('landing')
    setGroupId(null)
    setIsAdmin(false)
    setMyTravelerId(null)
    setResults(null)
    setTravelerNames({})
    setFinalPackageId(null)
    setMyOrderId(null)
  }

  const chosenPackage = results && finalPackageId
    ? results.itineraries.find(it => it.package_id === finalPackageId)
    : null

  return (
    <div>
      {page === 'landing' && <LandingPage onChoose={setPage} />}
      {page === 'create' && <CreateGroupPage onCreated={handleCreated} onBack={() => setPage('landing')} />}
      {page === 'join' && <JoinGroupPage onJoined={(code) => { setGroupId(code); setPage('form') }} onBack={() => setPage('landing')} />}
      {page === 'form' && <TravelerForm groupId={groupId} onJoined={handleJoined} />}
      {page === 'waiting' && <WaitingRoomPage groupId={groupId} isAdmin={isAdmin} onResultsReady={handleResultsReady} />}
      {page === 'vote' && results && (
        <ResultsVotePage
          groupId={groupId}
          myTravelerId={myTravelerId}
          results={results}
          travelerNames={travelerNames}
          isAdmin={isAdmin}
          onGoToAdminReview={() => setPage('admin-review')}
          onDecided={handleDecided}
        />
      )}
      {page === 'admin-review' && results && (
        <AdminReviewPage groupId={groupId} results={results} travelerNames={travelerNames} onDecided={handleDecided} />
      )}
      {page === 'buy' && (
        <BuyPage
          groupId={groupId}
          myTravelerId={myTravelerId}
          chosenPackage={chosenPackage}
          travelerNames={travelerNames}
          onPurchased={handlePurchased}
        />
      )}
     {page === 'confirmation' && (
        <ConfirmationPage orderId={myOrderId} chosenPackage={chosenPackage} groupId={groupId} onBackToStart={backToStart} />
      )}
    </div>
  )
}

export default App