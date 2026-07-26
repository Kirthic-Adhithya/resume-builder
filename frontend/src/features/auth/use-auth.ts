import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { useCurrentUser } from '@/features/auth/api'
import { clearStoredToken, getStoredToken } from '@/lib/auth-token'

// Single source of truth for "is anyone logged in right now" — every component that
// needs auth state (nav links, ProtectedRoute, the account page) goes through this
// instead of reading localStorage or the query cache directly.
export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const hasToken = Boolean(getStoredToken())
  const currentUser = useCurrentUser(hasToken)

  function logout() {
    clearStoredToken()
    queryClient.removeQueries({ queryKey: ['currentUser'] })
    navigate('/login')
  }

  return {
    user: currentUser.data,
    isLoading: hasToken && currentUser.isPending,
    isAuthenticated: hasToken && !currentUser.isError,
    logout,
  }
}
