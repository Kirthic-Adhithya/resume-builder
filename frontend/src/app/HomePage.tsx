import { FileText, MessageSquare, Target } from 'lucide-react'
import { Navigate, Link as RouterLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/use-auth'

const FEATURES = [
  {
    icon: FileText,
    title: 'LaTeX editor, live preview',
    description: 'Write in real LaTeX with a Monaco-powered editor and instant PDF preview.',
  },
  {
    icon: MessageSquare,
    title: 'AI writing assistant',
    description: 'Chat with an assistant that reads your resume and suggests real improvements.',
  },
  {
    icon: Target,
    title: 'ATS keyword matching',
    description: 'Paste a job description and get concrete, explained suggestions to match it.',
  },
]

export function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-16 bg-background px-6 py-16">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Resume Builder
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Write your resume in LaTeX with a live preview, and get AI suggestions tailored to the job
          you're applying for.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg">
            <RouterLink to="/register">Get started</RouterLink>
          </Button>
          <Button asChild variant="outline" size="lg">
            <RouterLink to="/login">Log in</RouterLink>
          </Button>
        </div>
      </div>

      <div className="grid max-w-4xl gap-8 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <h2 className="mt-3 text-sm font-medium text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
