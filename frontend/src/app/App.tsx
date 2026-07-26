import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { queryClient } from '@/app/query-client'
import { router } from '@/app/router'

// Provider order matters here only in the sense that QueryClientProvider must wrap
// anything that calls useQuery/useMutation — RouterProvider's routed components included.
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
