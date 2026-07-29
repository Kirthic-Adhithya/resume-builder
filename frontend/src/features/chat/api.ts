import { useQuery } from '@tanstack/react-query'

import type { ChatMessage } from '@/features/chat/types'
import { apiFetch, apiFetchStream } from '@/lib/api-client'

export function useChatHistory(resumeId: string) {
  return useQuery({
    queryKey: ['chat', resumeId],
    queryFn: () => apiFetch<ChatMessage[]>(`/api/v1/resumes/${resumeId}/chat`),
  })
}

// Not a TanStack Query mutation: the response body is a stream of text chunks arriving
// over time, not one resolved value — mutationFn expects the latter. This reads the
// Server-Sent-Events-formatted body directly and calls onDelta for each chunk as it
// arrives, so the UI can render text token-by-token instead of waiting for the full reply.
export async function streamChatMessage(
  resumeId: string,
  message: string,
  onDelta: (text: string) => void,
): Promise<void> {
  const response = await apiFetchStream(`/api/v1/resumes/${resumeId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Chat response had no body to stream')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) return

    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''

    for (const frame of frames) {
      if (!frame.startsWith('data: ')) continue
      const payload = frame.slice('data: '.length)
      if (payload === '[DONE]') return
      const { delta } = JSON.parse(payload) as { delta: string }
      onDelta(delta)
    }
  }
}
