import { Outlet } from 'react-router-dom'

import { TopNav } from '@/components/layout/top-nav'

// Shared chrome for every logged-in page — avoids each protected page (Dashboard,
// Account, and eventually Editor) reimplementing its own "who am I / log out" header.
// Rendered inside ProtectedRoute, so by the time this mounts, `user` is guaranteed.
export function ProtectedLayout() {
  return (
    <div className="min-h-svh bg-background">
      <TopNav />
      <Outlet />
    </div>
  )
}
