import { clearStoredToken, getStoredToken } from '@/lib/auth-token'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  })

  if (response.status === 401) {
    // Token missing/expired/invalid — clear it so the next render treats the user as
    // logged out, instead of retrying every request with a token the server rejects.
    clearStoredToken()
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${await response.text()}`)
  }

  return response.json() as Promise<T>
}
