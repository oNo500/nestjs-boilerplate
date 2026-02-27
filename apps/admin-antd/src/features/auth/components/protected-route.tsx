import { Navigate } from 'react-router'

import { useAuthStore } from '@/features/auth/stores/use-auth-store'

import type { UserRole } from '@/features/roles/types'

interface ProtectedRouteProperties {
  children: React.ReactNode
  requireRoles?: UserRole[]
}

export function ProtectedRoute({ children, requireRoles }: ProtectedRouteProperties) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If role verification is required and the user has role information
  if (requireRoles && user?.role && !requireRoles.includes(user.role as UserRole)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
