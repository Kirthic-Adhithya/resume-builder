import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/use-auth'

export function AccountPage() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Logged in as <span className="font-medium text-foreground">{user?.email}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
