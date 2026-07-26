import { QueryClient } from '@tanstack/react-query'

// One shared QueryClient for the whole app. `staleTime` defaults to 0 (TanStack Query's
// own default means "always refetch on mount") which is wrong for us most of the time —
// resumes/settings don't change from outside the app, so a short staleTime avoids
// redundant refetches without risking stale data for long.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})
