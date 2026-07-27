import { Link, Outlet } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/use-auth'

// Shared chrome for every logged-in page — avoids each protected page (Dashboard,
// Account, and eventually Editor) reimplementing its own "who am I / log out" header.
// Rendered inside ProtectedRoute, so by the time this mounts, `user` is guaranteed.
export function ProtectedLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-svh bg-background">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <nav className="flex gap-4 text-sm">
          <Link to="/dashboard" className="underline">
            Dashboard
          </Link>
          <Link to="/account" className="underline">
            Account
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{user?.email}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
