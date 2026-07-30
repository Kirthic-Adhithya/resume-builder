import Editor from '@monaco-editor/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChatPanel } from '@/features/chat/ChatPanel'
import {
  downloadResumeExport,
  useCompileResume,
  useResumeDetail,
  useResumeVersions,
  useRestoreVersion,
  useUpdateResumeContent,
} from '@/features/editor/api'

const AUTOSAVE_DELAY_MS = 1500

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) throw new Error('EditorPage rendered without a resume id in the route')

  const { data: resume, isPending } = useResumeDetail(id)
  const updateContent = useUpdateResumeContent(id)
  const compile = useCompileResume(id)
  const versions = useResumeVersions(id)
  const restoreVersion = useRestoreVersion(id)

  const [content, setContent] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [compileError, setCompileError] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const hasLoadedInitialContent = useRef(false)
  const autosaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Only seed local editor state from the fetched resume once — after that, the editor
  // is the source of truth. Otherwise a background refetch (e.g. from React Query's
  // window-refocus refetch) would clobber whatever the user is mid-typing.
  useEffect(() => {
    if (resume && !hasLoadedInitialContent.current) {
      setContent(resume.content)
      hasLoadedInitialContent.current = true
    }
  }, [resume])

  const runCompile = async () => {
    setCompileError(null)
    try {
      const blob = await compile.mutateAsync()
      setPdfUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return URL.createObjectURL(blob)
      })
    } catch (err) {
      setCompileError(err instanceof Error ? err.message : 'Compilation failed')
    }
  }

  // Debounce lives inside the change handler itself, not a useEffect watching `content`
  // — that was tried first and had a real bug: `content` also changes on initial load
  // and on version-restore, both of which would then autosave+compile immediately even
  // though the user hadn't typed anything. Keying off onChange means this only ever
  // fires for genuine user edits.
  function handleEditorChange(value: string | undefined) {
    const next = value ?? ''
    setContent(next)

    if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current)
    autosaveTimeout.current = setTimeout(() => {
      updateContent.mutate(next, { onSuccess: () => void runCompile() })
    }, AUTOSAVE_DELAY_MS)
  }

  useEffect(() => {
    return () => {
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current)
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup-only effect, intentionally no deps
  }, [])

  if (isPending || content === null) {
    return <div className="p-8 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="flex h-[calc(100svh-57px)] flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm underline">
            &larr; Dashboard
          </Link>
          <h1 className="font-medium">{resume?.title}</h1>
          {updateContent.isPending && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Version history
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {versions.data?.length === 0 && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No saved versions yet.
                </div>
              )}
              {versions.data?.map((version) => (
                <DropdownMenuItem
                  key={version.id}
                  onClick={() => {
                    restoreVersion.mutate(version.id, {
                      onSuccess: (restored) => setContent(restored.content),
                    })
                  }}
                >
                  {new Date(version.created_at).toLocaleString()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => void downloadResumeExport(id, 'pdf')}>
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void downloadResumeExport(id, 'latex')}>
                Download LaTeX (.tex)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void downloadResumeExport(id, 'json')}>
                Download JSON backup
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant={isChatOpen ? 'secondary' : 'outline'}
            onClick={() => setIsChatOpen((open) => !open)}
          >
            AI Assistant
          </Button>
          <Button size="sm" onClick={() => void runCompile()} disabled={compile.isPending}>
            {compile.isPending ? 'Compiling...' : 'Compile'}
          </Button>
        </div>
      </div>

      <div className={`grid flex-1 overflow-hidden ${isChatOpen ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <Editor
          language="latex"
          value={content}
          onChange={handleEditorChange}
          options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on' }}
        />
        <div className="border-l">
          {compileError ? (
            <pre className="h-full overflow-auto whitespace-pre-wrap p-4 text-sm text-destructive">
              {compileError}
            </pre>
          ) : pdfUrl ? (
            <iframe src={pdfUrl} title="Resume preview" className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Click "Compile" to see a preview.
            </div>
          )}
        </div>
        {isChatOpen && <ChatPanel resumeId={id} />}
      </div>
    </div>
  )
}
