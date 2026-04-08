import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext.jsx'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 md:px-6">
        <div>
          <p className="text-lg font-bold tracking-tight text-slate-900">Study Hive</p>
          <p className="text-xs text-slate-500">Learning Operations Dashboard</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden text-sm text-slate-700 md:inline">{user?.name ?? 'Guest'}</span>
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
            {user?.role ?? 'student'}
          </span>
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
