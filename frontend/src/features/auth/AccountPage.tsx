import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChangePasswordForm } from '@/features/auth/ChangePasswordForm'
import { useAuth } from '@/features/auth/use-auth'

export function AccountPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-sm space-y-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Logged in as <span className="font-medium text-foreground">{user?.email}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
