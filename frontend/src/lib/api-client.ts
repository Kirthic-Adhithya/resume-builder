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

  if (response.status === 204) {
    // No Content — there's no body to parse (DELETE endpoints return this).
    return undefined as T
  }

  return response.json() as Promise<T>
}

// Separate from apiFetch because the compile endpoint returns raw PDF bytes, not JSON —
// response.json() would just throw on a binary body.
export async function apiFetchBlob(path: string, init?: RequestInit): Promise<Blob> {
  const token = getStoredToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  })

  if (response.status === 401) {
    clearStoredToken()
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${await response.text()}`)
  }

  return response.blob()
}

// Returns the raw Response so the caller can read response.body as a stream — used for
// SSE-style endpoints (chat) where data arrives incrementally, not as one JSON payload.
export async function apiFetchStream(path: string, init?: RequestInit): Promise<Response> {
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
    clearStoredToken()
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${await response.text()}`)
  }

  return response
}
