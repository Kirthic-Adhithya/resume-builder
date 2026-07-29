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
    mutationFn: () => apiFetchBlob(`/api/v1/resumes/${id}/compile`, { method: 'POST' }),
  })
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
