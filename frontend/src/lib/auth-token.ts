// Lives in lib/ (not features/auth/) because api-client.ts — a generic, feature-agnostic
// helper — needs to read it on every request. It's just a localStorage wrapper; the
// actual login/logout business logic lives in features/auth/.
const TOKEN_KEY = 'resume-builder:access_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
