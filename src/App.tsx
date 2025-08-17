import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import MonitoringPage from './pages/MonitoringPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/monitoring" element={<MonitoringPage />} />
    </Routes>
  )
}
