import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import PatientLogin from './pages/PatientLogin'
import ClinicianLogin from './pages/ClinicianLogin'
import PatientHome from './pages/PatientHome'
import CheckIn from './pages/CheckIn'
import ClinicianDashboard from './pages/ClinicianDashboard'
import PatientDetail from './pages/PatientDetail'

export default function App() {
  return (
    <div className="relative z-10 min-h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login/patient" element={<PatientLogin />} />
        <Route path="/login/clinician" element={<ClinicianLogin />} />
        <Route path="/patient" element={<PatientHome />} />
        <Route path="/patient/checkin" element={<CheckIn />} />
        <Route path="/clinician" element={<ClinicianDashboard />} />
        <Route path="/clinician/patient/:id" element={<PatientDetail />} />
      </Routes>
    </div>
  )
}
