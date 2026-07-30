import { Check, Circle, FileCode2, Play } from 'lucide-react'

const codeLines: Array<Array<{ t: string; c?: string }>> = [
  [{ t: '\\section', c: 'kw' }, { t: '{Experience}' }],
  [
    { t: '\\textbf', c: 'kw' },
    { t: '{Senior Backend Engineer} ' },
    { t: '\\hfill', c: 'kw' },
    { t: ' 2023 -- Present' },
  ],
  [
    { t: '\\begin', c: 'kw' },
    { t: '{itemize}', c: 'env' },
  ],
  [{ t: '  \\item', c: 'kw' }, { t: ' Developed scalable FastAPI microservices' }],
  [{ t: '        reducing p95 latency by ' }, { t: '35\\%', c: 'num' }, { t: '.' }],
  [{ t: '  \\item', c: 'kw' }, { t: ' Led migration of 40+ services to a shared' }],
  [{ t: '        observability pipeline.' }],
  [
    { t: '\\end', c: 'kw' },
    { t: '{itemize}', c: 'env' },
  ],
]

const tone: Record<string, string> = {
  kw: 'text-[#c792ea]',
  env: 'text-[#82aaff]',
  num: 'text-[#f78c6c]',
}

export function EditorMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-paper)]">
      <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-3 py-2">
        <div className="flex gap-1.5" aria-hidden="true">
          <Circle className="size-2.5 fill-destructive/60 text-destructive/60" />
          <Circle className="size-2.5 fill-ice text-ice" />
          <Circle className="size-2.5 fill-success/60 text-success/60" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileCode2 className="size-3.5" />
          <span className="font-mono">resume.tex</span>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
          <Check className="size-3" /> Saved
        </span>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="bg-[#11131a] p-4 font-mono text-[11.5px] leading-6 text-[#c7cbd6] sm:text-xs">
          {codeLines.map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="w-4 shrink-0 text-right text-[#4b5162] select-none">{i + 1}</span>
              <span className="truncate">
                {line.map((tok, j) => (
                  <span key={j} className={tok.c ? tone[tok.c] : undefined}>
                    {tok.t}
                  </span>
                ))}
              </span>
            </div>
          ))}
          <div className="mt-4 flex items-center gap-2 rounded-md border border-[#2a2f3d] bg-[#171a23] px-2.5 py-1.5 text-[11px] text-[#8b93a7]">
            <Play className="size-3 text-[#c792ea]" />
            Compiled in 812 ms · 1 page · 0 errors
          </div>
        </div>

        <div className="hidden border-l border-border bg-muted/40 p-5 md:block">
          <div className="mx-auto aspect-[1/1.32] w-full max-w-[260px] rounded-sm bg-white p-5 shadow-[var(--shadow-paper)]">
            <div className="text-center">
              <div className="text-[11px] font-bold tracking-tight text-neutral-900">
                JORDAN AVERY
              </div>
              <div className="mt-0.5 text-[6px] text-neutral-500">
                Berlin, DE · jordan@example.com · github.com/jordan
              </div>
            </div>
            <div className="mt-3 border-b border-neutral-300 pb-0.5 text-[7px] font-bold text-neutral-900">
              EXPERIENCE
            </div>
            <div className="mt-1.5 space-y-2">
              {[0, 1].map((k) => (
                <div key={k}>
                  <div className="flex justify-between text-[6.5px] font-semibold text-neutral-800">
                    <span>{k === 0 ? 'Senior Backend Engineer' : 'Backend Engineer'}</span>
                    <span>{k === 0 ? '2023 — Now' : '2020 — 2023'}</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {[0, 1, 2].map((r) => (
                      <div
                        key={r}
                        className="h-[3px] rounded-full bg-neutral-200"
                        style={{ width: `${96 - r * 12}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 border-b border-neutral-300 pb-0.5 text-[7px] font-bold text-neutral-900">
              SKILLS
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="h-[3px] w-full rounded-full bg-neutral-200" />
              <div className="h-[3px] w-2/3 rounded-full bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
