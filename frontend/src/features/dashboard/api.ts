import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Resume, ResumeListResponse } from '@/features/dashboard/types'
import { apiFetch } from '@/lib/api-client'

const RESUMES_KEY = ['resumes'] as const

export function useResumes(search: string, page: number, pageSize = 10) {
  return useQuery({
    queryKey: [...RESUMES_KEY, { search, page, pageSize }],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
      if (search) params.set('search', search)
      return apiFetch<ResumeListResponse>(`/api/v1/resumes?${params.toString()}`)
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useCreateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ title, template }: { title: string; template: string }) =>
      apiFetch<Resume>('/api/v1/resumes', {
        method: 'POST',
        body: JSON.stringify({ title, template }),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: RESUMES_KEY }),
  })
}

export function useRenameResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      apiFetch<Resume>(`/api/v1/resumes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: RESUMES_KEY }),
  })
}

export function useDuplicateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<Resume>(`/api/v1/resumes/${id}/duplicate`, { method: 'POST' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: RESUMES_KEY }),
  })
}

export function useDeleteResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/v1/resumes/${id}`, { method: 'DELETE' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: RESUMES_KEY }),
  })
}
