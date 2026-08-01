import { useQueryClient } from '@tanstack/react-query'
import { FileCode2, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { streamChatMessage, useChatHistory } from '@/features/chat/api'

// Only matches once the closing fence has actually streamed in — while a reply is
// still mid-stream (opening ```latex present, no closing ``` yet), this returns no
// match and the partial text just renders as plain prose, so a suggestion card never
// flashes in a broken/incomplete state.
const LATEX_FENCE_RE = /```latex\n([\s\S]*?)```/

function extractSuggestion(content: string): {
  before: string
  suggestion: string | null
  after: string
} {
  const match = LATEX_FENCE_RE.exec(content)
  if (!match) return { before: content, suggestion: null, after: '' }
  return {
    before: content.slice(0, match.index).trim(),
    suggestion: match[1].trim(),
    after: content.slice(match.index + match[0].length).trim(),
  }
}

// Key used for the in-flight streaming reply's accept/reject state — there's only
// ever one streaming message at a time, so a constant key is enough. Once the reply
// finishes and history refetches, it's replaced by a persisted message with a real
// id; that fresh render starts without accept/reject state, which is an accepted
// trade-off (ephemeral UI state, not worth persisting to the backend for this).
const STREAMING_KEY = '__streaming__'

export function ChatPanel({
  resumeId,
  onClose,
  onApplySuggestion,
}: {
  resumeId: string
  onClose?: () => void
  onApplySuggestion?: (content: string) => void
}) {
  const { data: history } = useChatHistory(resumeId)
  const queryClient = useQueryClient()

  const [input, setInput] = useState('')
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null)
  const [streamingReply, setStreamingReply] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestionStatus, setSuggestionStatus] = useState<Record<string, 'applied' | 'dismissed'>>(
    {},
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, streamingReply])

  async function handleSend() {
    const message = input.trim()
    if (!message || isSending) return

    setInput('')
    setError(null)
    setPendingUserMessage(message)
    setStreamingReply('')
    setIsSending(true)

    try {
      await streamChatMessage(resumeId, message, (delta) => {
        setStreamingReply((previous) => (previous ?? '') + delta)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      // The real, persisted messages (with real ids/timestamps) replace these
      // temporary bubbles once the refetch lands.
      setIsSending(false)
      setPendingUserMessage(null)
      setStreamingReply(null)
      void queryClient.invalidateQueries({ queryKey: ['chat', resumeId] })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center gap-1.5 border-b border-border px-3">
        <Sparkles className="size-3.5 text-primary" />
        <span className="text-sm font-medium">AI Assistant</span>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-7"
            onClick={onClose}
            aria-label="Close AI assistant"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-3">
        {history?.length === 0 && !pendingUserMessage && (
          <p className="text-sm text-muted-foreground">
            Ask about your resume — paste a job description and ask what to change, or request
            stronger action verbs, ATS keywords, or STAR-format bullet points.
          </p>
        )}
        {history?.map((message) => (
          <ChatBubble
            key={message.id}
            role={message.role}
            content={message.content}
            suggestionKey={message.id}
            status={suggestionStatus[message.id]}
            onAccept={(content) => {
              onApplySuggestion?.(content)
              setSuggestionStatus((s) => ({ ...s, [message.id]: 'applied' }))
            }}
            onReject={() => setSuggestionStatus((s) => ({ ...s, [message.id]: 'dismissed' }))}
          />
        ))}
        {pendingUserMessage && <ChatBubble role="user" content={pendingUserMessage} />}
        {streamingReply !== null && (
          <ChatBubble
            role="assistant"
            content={streamingReply || '…'}
            suggestionKey={STREAMING_KEY}
            status={suggestionStatus[STREAMING_KEY]}
            onAccept={(content) => {
              onApplySuggestion?.(content)
              setSuggestionStatus((s) => ({ ...s, [STREAMING_KEY]: 'applied' }))
            }}
            onReject={() => setSuggestionStatus((s) => ({ ...s, [STREAMING_KEY]: 'dismissed' }))}
          />
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t p-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void handleSend()
            }
          }}
          placeholder="Ask about your resume..."
          disabled={isSending}
        />
        <Button onClick={() => void handleSend()} disabled={isSending || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  )
}

function bubbleClassName(role: 'user' | 'assistant') {
  return (
    'inline-block max-w-[85%] rounded-lg px-3 py-2 text-left text-sm whitespace-pre-wrap ' +
    (role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')
  )
}

function ChatBubble({
  role,
  content,
  suggestionKey,
  status,
  onAccept,
  onReject,
}: {
  role: 'user' | 'assistant'
  content: string
  suggestionKey?: string
  status?: 'applied' | 'dismissed'
  onAccept?: (content: string) => void
  onReject?: () => void
}) {
  const { before, suggestion, after } =
    role === 'assistant'
      ? extractSuggestion(content)
      : { before: content, suggestion: null, after: '' }

  return (
    <div className={role === 'user' ? 'text-right' : 'text-left'}>
      {before && <div className={bubbleClassName(role)}>{before}</div>}
      {suggestion && (
        <div
          key={suggestionKey}
          className="mt-2 w-full max-w-[95%] rounded-lg border border-border bg-card text-left shadow-sm"
        >
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-1.5">
            <FileCode2 className="size-3.5 text-primary" />
            <span className="text-xs font-medium">Suggested revision</span>
          </div>
          <pre className="max-h-48 overflow-auto p-2 font-mono text-xs whitespace-pre-wrap text-muted-foreground">
            {suggestion}
          </pre>
          <div className="flex items-center gap-2 border-t border-border p-2">
            {status === 'applied' ? (
              <span className="text-xs text-success">Applied to editor</span>
            ) : status === 'dismissed' ? (
              <span className="text-xs text-muted-foreground">Dismissed</span>
            ) : (
              <>
                <Button size="sm" className="h-7" onClick={() => onAccept?.(suggestion)}>
                  Accept
                </Button>
                <Button size="sm" variant="outline" className="h-7" onClick={() => onReject?.()}>
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      {after && <div className={`${bubbleClassName(role)} mt-2`}>{after}</div>}
    </div>
  )
}
