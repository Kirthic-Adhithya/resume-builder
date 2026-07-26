import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/use-auth'
import { apiFetch } from '@/lib/api-client'

// Temporary placeholder route. Exists only to prove the foundation is wired end-to-end
// (Tailwind + shadcn rendering, TanStack Query talking to the FastAPI backend). Gets
// replaced by the real landing/dashboard route in Phase 2.
export function HomePage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<{ status: string }>('/api/v1/health'),
  })
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Resume Builder — Foundation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Backend health check: {isPending && 'checking...'}
            {isError && <span className="text-destructive">unreachable</span>}
            {data && <span className="font-medium text-foreground">{data.status}</span>}
          </p>
          <Button onClick={() => window.location.reload()}>Re-check</Button>
          <div className="flex justify-center gap-4 text-sm">
            {isAuthenticated ? (
              <Link to="/account" className="underline">
                Account
              </Link>
            ) : (
              <>
                <Link to="/login" className="underline">
                  Log in
                </Link>
                <Link to="/register" className="underline">
                  Register
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
