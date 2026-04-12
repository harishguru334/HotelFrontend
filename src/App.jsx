import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login      from './pages/Login'
import Signup     from './pages/Signup'
import Dashboard  from './pages/Dashboard'
import RoomInn    from './pages/RoomInn'
import FoodInn    from './pages/FoodInn'
import AdminPanel from './pages/AdminPanel'
import BillingPage from './pages/BillingPage'
import { DineInn, GardenInn, PoolInn, PartyInn, LaundryInn } from './pages/ServicePages'

const P = ({ children }) => (
  <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right"
          toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontFamily: 'Poppins, sans-serif', fontSize: '14px' } }} />
        <Routes>
          <Route path="/login"        element={<Login />} />
          <Route path="/signup"       element={<Signup />} />
          <Route path="/dashboard"    element={<P><Dashboard /></P>} />
          <Route path="/room-inn"     element={<P><RoomInn /></P>} />
          <Route path="/food-inn"     element={<P><FoodInn /></P>} />
          <Route path="/dine-inn"     element={<P><DineInn /></P>} />
          <Route path="/garden-inn"   element={<P><GardenInn /></P>} />
          <Route path="/pool-inn"     element={<P><PoolInn /></P>} />
          <Route path="/party-inn"    element={<P><PartyInn /></P>} />
          <Route path="/laundry-inn"  element={<P><LaundryInn /></P>} />
          <Route path="/billing"      element={<P><BillingPage /></P>} />
          <Route path="/admin"        element={<P><AdminPanel /></P>} />
          <Route path="*"             element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
