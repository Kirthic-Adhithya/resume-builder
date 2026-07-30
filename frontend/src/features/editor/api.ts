import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ResumeDetail, ResumeVersion } from '@/features/editor/types'
import { apiFetch, apiFetchBlob } from '@/lib/api-client'

export function useResumeDetail(id: string) {
  return useQuery({
    queryKey: ['resume', id],
    queryFn: () => apiFetch<ResumeDetail>(`/api/v1/resumes/${id}`),
  })
}

export function useUpdateResumeContent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch<ResumeDetail>(`/api/v1/resumes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['resume', id], updated)
      void queryClient.invalidateQueries({ queryKey: ['resumes'] })
      void queryClient.invalidateQueries({ queryKey: ['resume-versions', id] })
    },
  })
}

export function useCompileResume(id: string) {
  return useMutation({
    // Passing content directly compiles exactly what's in the editor right now, instead
    // of always compiling whatever was last persisted — that's what lets save and
    // compile run in parallel instead of compile waiting on save to finish first.
    mutationFn: (content?: string) =>
      apiFetchBlob(`/api/v1/resumes/${id}/compile`, {
        method: 'POST',
        body: content !== undefined ? JSON.stringify({ content }) : undefined,
      }),
  })
}

// Not a query/mutation hook — a one-shot action with no state to track. Downloads can't
// just be an <a href> because the request needs an Authorization header, which a plain
// link can't send — so we fetch the file as a blob ourselves and trigger the save
// dialog via a throwaway object URL.
export async function downloadResumeExport(
  id: string,
  format: 'pdf' | 'latex' | 'json',
): Promise<void> {
  const extension = format === 'latex' ? 'tex' : format
  const blob = await apiFetchBlob(`/api/v1/resumes/${id}/export/${format}`)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `resume.${extension}`
  link.click()
  URL.revokeObjectURL(url)
}

export function useResumeVersions(id: string) {
  return useQuery({
    queryKey: ['resume-versions', id],
    queryFn: () => apiFetch<ResumeVersion[]>(`/api/v1/resumes/${id}/versions`),
  })
}

export function useRestoreVersion(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (versionId: string) =>
      apiFetch<ResumeDetail>(`/api/v1/resumes/${id}/versions/${versionId}/restore`, {
        method: 'POST',
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['resume', id], updated)
      void queryClient.invalidateQueries({ queryKey: ['resume-versions', id] })
    },
  })
}
