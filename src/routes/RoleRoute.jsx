import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export function RoleRoute({ allowedRoles }) {
  const { user } = useAuth()
  const role = user?.role?.toLowerCase()
  const normalizedAllowed = allowedRoles.map((item) => item.toLowerCase())

  if (!normalizedAllowed.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
