import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiGrid, FiKey, FiCoffee, FiUsers, FiStar,
  FiDroplet, FiMusic, FiPackage, FiSettings,
  FiFileText, FiLogOut, FiMenu, FiX
} from 'react-icons/fi'

const navItems = [
  { path: '/dashboard',   label: 'Dashboard',   icon: <FiGrid /> },
  { path: '/room-inn',    label: 'Room Inn',     icon: <FiKey /> },
  { path: '/food-inn',    label: 'Food Inn',     icon: <FiCoffee /> },
  { path: '/dine-inn',    label: 'Dine Inn',     icon: <FiUsers /> },
  { path: '/garden-inn',  label: 'Garden Inn',   icon: <FiStar /> },
  { path: '/pool-inn',    label: 'Pool Inn',     icon: <FiDroplet /> },
  { path: '/party-inn',   label: 'Party Inn',    icon: <FiMusic /> },
  { path: '/laundry-inn', label: 'Laundry Inn',  icon: <FiPackage /> },
  { path: '/billing',     label: 'Billing',      icon: <FiFileText /> },
  { path: '/admin',       label: 'Admin Panel',  icon: <FiSettings /> },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-hotel-dark text-white flex items-center justify-between px-4 py-3 shadow-lg">
        <span className="font-serif font-bold text-hotel-gold text-lg">🏨 Hotel Inn</span>
        <button onClick={() => setOpen(!open)}>
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-hotel-dark text-white flex flex-col z-40 transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        <div className="p-6 border-b border-white/10">
          <h1 className="font-serif text-2xl font-bold text-hotel-gold">🏨 Hotel Inn</h1>
          <p className="text-xs text-gray-400 mt-1">Management System</p>
        </div>

        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-hotel-gold flex items-center justify-center font-bold text-hotel-dark">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, label, icon }) => (
            <Link key={path} to={path} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${location.pathname === path
                  ? 'bg-hotel-gold text-white shadow'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />}
    </>
  )
}
