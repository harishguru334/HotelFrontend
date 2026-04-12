import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { FiKey, FiCoffee, FiUsers, FiAlertCircle } from 'react-icons/fi'

const StatCard = ({ label, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-bold text-hotel-dark">{value}</p>
    </div>
  </div>
)

const QUICK = [
  { label: 'Room Inn',    to: '/room-inn',    emoji: '🏨', bg: 'bg-blue-50 hover:bg-blue-100' },
  { label: 'Food Inn',    to: '/food-inn',    emoji: '🍽️', bg: 'bg-orange-50 hover:bg-orange-100' },
  { label: 'Dine Inn',    to: '/dine-inn',    emoji: '🥂', bg: 'bg-purple-50 hover:bg-purple-100' },
  { label: 'Garden Inn',  to: '/garden-inn',  emoji: '🌿', bg: 'bg-green-50 hover:bg-green-100' },
  { label: 'Pool Inn',    to: '/pool-inn',    emoji: '🏊', bg: 'bg-cyan-50 hover:bg-cyan-100' },
  { label: 'Party Inn',   to: '/party-inn',   emoji: '🎉', bg: 'bg-pink-50 hover:bg-pink-100' },
  { label: 'Laundry Inn', to: '/laundry-inn', emoji: '👕', bg: 'bg-yellow-50 hover:bg-yellow-100' },
  { label: 'Billing',     to: '/billing',     emoji: '🧾', bg: 'bg-gray-50 hover:bg-gray-100' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats]             = useState({ rooms: 0, occupied: 0, checkins: 0, food: 0 })
  const [recentBookings, setRecent]   = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [r, b, f] = await Promise.all([API.get('/rooms'), API.get('/bookings'), API.get('/food')])
        setStats({
          rooms:    r.data.length,
          occupied: r.data.filter(x => x.status === 'occupied').length,
          checkins: b.data.filter(x => x.status === 'checked-in').length,
          food:     f.data.filter(x => x.status === 'pending').length,
        })
        setRecent(b.data.slice(0, 6))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const hr = new Date().getHours()
  const greet = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-hotel-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-hotel-dark">{greet}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here's your hotel overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Rooms"       value={stats.rooms}    icon={<FiKey />}         color="bg-hotel-blue" />
        <StatCard label="Occupied"          value={stats.occupied} icon={<FiAlertCircle />} color="bg-red-500" />
        <StatCard label="Active Check-ins"  value={stats.checkins} icon={<FiUsers />}       color="bg-green-500" />
        <StatCard label="Pending Orders"    value={stats.food}     icon={<FiCoffee />}      color="bg-hotel-gold" />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-serif font-semibold text-hotel-dark mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK.map(({ label, to, emoji, bg }) => (
            <Link key={to} to={to} className={`${bg} rounded-2xl p-4 text-center transition block`}>
              <div className="text-3xl mb-2">{emoji}</div>
              <p className="text-sm font-semibold text-gray-700">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-serif font-semibold text-hotel-dark mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Guest', 'Room', 'Check-In', 'Status'].map(h => (
                  <th key={h} className="text-left py-2 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0
                ? <tr><td colSpan="4" className="text-center py-10 text-gray-400">No bookings yet</td></tr>
                : recentBookings.map(b => (
                  <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium">{b.guestName}</td>
                    <td className="py-3 text-gray-600">{b.roomNumber}</td>
                    <td className="py-3 text-gray-600">{new Date(b.checkIn).toLocaleDateString('en-IN')}</td>
                    <td className="py-3">
                      <span className={b.status === 'checked-in' ? 'badge-confirmed' : b.status === 'checked-out' ? 'badge-completed' : 'badge-pending'}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
