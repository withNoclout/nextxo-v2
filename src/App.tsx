import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import RealtimeCarbonPage from './pages/RealtimeCarbon'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/realtime-carbon" element={<RealtimeCarbonPage />} />
      </Routes>
    </BrowserRouter>
  )
}
