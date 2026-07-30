import { ArrowRight, Bot, ChevronRight, FileCode2, Gauge, Sparkle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, Link as RouterLink } from 'react-router-dom'

import { EditorMockup } from '@/components/marketing/editor-mockup'
import { Footer } from '@/components/layout/footer'
import { TopNav } from '@/components/layout/top-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/features/auth/use-auth'
import { TEMPLATES } from '@/lib/templates'

const FEATURES = [
  {
    icon: FileCode2,
    title: 'LaTeX editor',
    body: 'Monaco with LaTeX syntax highlighting and instant recompiles. Your document stays plain text and version-controllable.',
  },
  {
    icon: Bot,
    title: 'AI assistant',
    body: 'Chat with an assistant that reads your resume and suggests real, specific improvements as you write.',
  },
  {
    icon: Gauge,
    title: 'Live PDF preview',
    body: 'See exactly what you’ll submit — compiled from your real .tex source, not an approximation.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Start from a template',
    body: 'Pick a starter layout or paste your existing .tex source.',
  },
  {
    n: '02',
    title: 'Edit with AI alongside',
    body: 'Ask the assistant for rewrites inline while you keep full control of the document.',
  },
  {
    n: '03',
    title: 'Compile, save, export',
    body: 'Every keystroke recompiles live. Export to PDF, LaTeX, or JSON whenever you like.',
  },
]

function Section({ children, alt = false }: { children: ReactNode; alt?: boolean }) {
  return (
    <section className={`border-b border-border ${alt ? 'surface-alt' : 'bg-background'}`}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">{children}</div>
    </section>
  )
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body?: string
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs tracking-widest text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {body && <p className="mt-3 text-base leading-relaxed text-muted-foreground">{body}</p>}
    </div>
  )
}

export function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <section className="relative border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 grid-lines opacity-60"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-normal text-muted-foreground"
            >
              <Sparkle className="size-3 text-primary" />
              AI suggestions, live PDF preview, one document
              <ChevronRight className="size-3" />
            </Badge>
            <h1 className="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-6xl">
              Build beautiful,
              <br className="hidden sm:block" /> ATS-friendly resumes with AI
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Write your resume in LaTeX with a live preview, and get AI suggestions tailored to the
              job you're applying for.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <RouterLink to="/register">
                  Get started <ArrowRight className="size-4" />
                </RouterLink>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <RouterLink to="/login">Log in</RouterLink>
              </Button>
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              No credit card · Export anytime · Your .tex stays yours
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-5xl">
            <EditorMockup />
          </div>
        </div>
      </section>

      <Section alt>
        <SectionHeading
          eyebrow="Core"
          title="Three tools, one document"
          body="No separate exports, no copy-pasting between a chatbot and an editor."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className="card-lift h-full rounded-xl border-border bg-card shadow-[var(--shadow-card)]"
            >
              <CardContent className="p-6">
                <span className="grid size-9 place-items-center rounded-lg border border-border bg-background text-primary">
                  <f.icon className="size-4.5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Workflow" title="How it works" />
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-card p-6">
              <span className="font-mono text-xs text-primary">{s.n}</span>
              <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section alt>
        <SectionHeading eyebrow="Templates" title="Start from something that already parses" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.slice(0, 4).map((t) => (
            <Card
              key={t.name}
              className="card-lift h-full overflow-hidden rounded-xl border-border shadow-[var(--shadow-card)]"
            >
              <div className="border-b border-border bg-muted/50 p-4">
                <div className="mx-auto aspect-[1/1.32] w-full max-w-[150px] rounded-sm bg-white p-3 shadow-sm">
                  <div className="h-1.5 w-1/2 rounded-full bg-neutral-800" />
                  <div className="mt-1 h-[3px] w-2/3 rounded-full bg-neutral-300" />
                  <div className="mt-3 h-[3px] w-1/3 rounded-full bg-neutral-700" />
                  <div className="mt-1.5 space-y-1">
                    {[100, 90, 80, 94, 70].map((w, k) => (
                      <div
                        key={k}
                        className="h-[3px] rounded-full bg-neutral-200"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{t.name}</h3>
                  <Badge variant="secondary" className="rounded-md font-normal">
                    {t.tag}
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {t.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          <RouterLink to="/register" className="text-primary hover:underline">
            Create an account
          </RouterLink>{' '}
          to browse the full template gallery.
        </p>
      </Section>

      <Section>
        <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card px-6 py-12 text-center shadow-[var(--shadow-card)]">
          <h2 className="max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
            Your next resume compiles in under a second
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Start free, keep the source, export whenever you like.
          </p>
          <Button size="lg" asChild>
            <RouterLink to="/register">
              Create your resume <ArrowRight className="size-4" />
            </RouterLink>
          </Button>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
