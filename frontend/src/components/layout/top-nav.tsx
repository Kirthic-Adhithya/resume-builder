import { Menu } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { Brand } from '@/components/brand'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/app/ThemeToggle'
import { useAuth } from '@/features/auth/use-auth'
import { cn } from '@/lib/utils'

const authedLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/account', label: 'Account' },
] as const

// Reads real auth state via useAuth() rather than taking an `authed` prop — this nav
// is rendered on both public and protected pages, and needs to reflect whichever is
// actually true right now, not whatever the parent route happened to pass in.
export function TopNav({ className }: { className?: string }) {
  const { user, isAuthenticated, logout } = useAuth()
  const initials = user?.email.slice(0, 2).toUpperCase() ?? '?'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-sm',
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Resume Builder home">
          <Brand />
        </Link>

        {isAuthenticated && (
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {authedLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground',
                    isActive && 'bg-accent text-foreground',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-1 rounded-full ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Account menu"
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </div>
          )}

          {isAuthenticated && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 md:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="border-b border-border px-5 py-4">
                  <Brand />
                </div>
                <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
                  {authedLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-2 border-t border-border p-3">
                  <Button variant="outline" onClick={logout}>
                    Sign out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}
