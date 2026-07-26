import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Credentials, TokenResponse, User } from '@/features/auth/types'
import { apiFetch } from '@/lib/api-client'
import { setStoredToken } from '@/lib/auth-token'

export function useRegister() {
  return useMutation({
    mutationFn: (credentials: Credentials) =>
      apiFetch<User>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: Credentials) =>
      apiFetch<TokenResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      setStoredToken(data.access_token)
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export function useCurrentUser(enabled: boolean) {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiFetch<User>('/api/v1/auth/me'),
    enabled,
    retry: false,
  })
}
