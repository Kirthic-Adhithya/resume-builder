import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { ThemeToggle } from '@/app/ThemeToggle'
import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useRegister } from '@/features/auth/api'

// min(8) mirrors the backend's RegisterRequest validation (presentation/schemas/auth.py)
// — this is a UX nicety (fail fast, no round trip), not the source of truth for the rule.
const registerSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  })
  const password = useWatch({ control: form.control, name: 'password' })

  function onSubmit(values: RegisterFormValues) {
    register.mutate(values, {
      onSuccess: () => {
        toast.success('Account created — log in to continue')
        navigate('/login')
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Registration failed'),
    })
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
        <ThemeToggle />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center">
            <Brand size="lg" />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Free to start — write your first resume in minutes.
            </p>
          </div>

          <Card className="mt-6 rounded-xl border-border shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              placeholder="••••••••"
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <p
                          className={`flex items-center gap-1.5 pt-1 text-xs ${
                            password.length >= 8 ? 'text-success' : 'text-muted-foreground'
                          }`}
                        >
                          <Check className="size-3" /> At least 8 characters
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {register.isError && (
                    <p className="text-sm text-destructive">
                      {register.error instanceof Error
                        ? register.error.message
                        : 'Registration failed'}
                    </p>
                  )}
                  <Button type="submit" className="w-full" disabled={register.isPending}>
                    {register.isPending ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
