import { useQueryClient } from '@tanstack/react-query'
import { Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { streamChatMessage, useChatHistory } from '@/features/chat/api'

export function ChatPanel({ resumeId, onClose }: { resumeId: string; onClose?: () => void }) {
  const { data: history } = useChatHistory(resumeId)
  const queryClient = useQueryClient()

  const [input, setInput] = useState('')
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null)
  const [streamingReply, setStreamingReply] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
          <ChatBubble key={message.id} role={message.role} content={message.content} />
        ))}
        {pendingUserMessage && <ChatBubble role="user" content={pendingUserMessage} />}
        {streamingReply !== null && <ChatBubble role="assistant" content={streamingReply || '…'} />}
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

function ChatBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  return (
    <div className={role === 'user' ? 'text-right' : 'text-left'}>
      <div
        className={
          'inline-block max-w-[85%] rounded-lg px-3 py-2 text-left text-sm whitespace-pre-wrap ' +
          (role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')
        }
      >
        {content}
      </div>
    </div>
  )
}
