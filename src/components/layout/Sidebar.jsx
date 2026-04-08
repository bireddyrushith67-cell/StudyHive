import { NavLink } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext.jsx'

const ownerMenu = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Users', path: '/users' },
  { label: 'Schools', path: '/schools' },
  { label: 'Classes', path: '/classes' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Competitions', path: '/competitions' },
  { label: 'Video Rooms', path: '/video-rooms' },
  { label: 'General Chat', path: '/general-chat' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Profile', path: '/profile' },
]

const adminMenu = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Users', path: '/users' },
  { label: 'Classes', path: '/classes' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Competitions', path: '/competitions' },
  { label: 'Video Rooms', path: '/video-rooms' },
  { label: 'General Chat', path: '/general-chat' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Profile', path: '/profile' },
]

const principalMenu = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Classes', path: '/classes' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Video Rooms', path: '/video-rooms' },
  { label: 'General Chat', path: '/general-chat' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Profile', path: '/profile' },
]

const teacherMenu = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Classes', path: '/classes' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Competitions', path: '/competitions' },
  { label: 'Video Rooms', path: '/video-rooms' },
  { label: 'General Chat', path: '/general-chat' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Profile', path: '/profile' },
]

const studentMenu = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Video Rooms', path: '/video-rooms' },
  { label: 'General Chat', path: '/general-chat' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Profile', path: '/profile' },
]

export function Sidebar() {
  const { user } = useAuth()
  const role = (user?.role ?? 'student').toLowerCase()

  let menuItems = studentMenu
  if (role === 'owner') menuItems = ownerMenu
  else if (role === 'admin') menuItems = adminMenu
  else if (role === 'school_admin') menuItems = adminMenu
  else if (role === 'principal' || role === 'dean') menuItems = principalMenu
  else if (role.includes('teacher')) menuItems = teacherMenu

  return (
    <aside className="border-r border-slate-200 bg-white/95 p-3 md:p-4">
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Navigation
      </p>
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
