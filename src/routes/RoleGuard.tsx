import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

type RoleGuardProps = {
  allowedRoles: string[]
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.user.role)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
