import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiClientError } from './api-error'

import type { DefaultOptions } from '@tanstack/react-query'

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiClientError) {
        if (error.status === 0) return false
        if (error.status >= 400 && error.status < 500) return false
      }
      return failureCount < 1
    },
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
    // NOTE: Do not put global error handling in defaultOptions.mutations.onError.
    // Reason: a per-mutation onError overrides the defaultOptions one, so mutations
    // with custom onError handlers would never trigger the global toast.
    // Global error handling lives in MutationCache.onError below.
  },
}

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
  queryCache: new QueryCache({
    // Silently ignore background refetch failures when cached data exists; toast only on cold misses
    onError: (error, query) => {
      if (query.state.data !== undefined) return
      if (error instanceof ApiClientError && error.errors.length === 0) {
        toast.error(error.userMessage)
      } else if (!(error instanceof ApiClientError)) {
        toast.error('Request failed')
      }
    },
  }),
  mutationCache: new MutationCache({
    // Global mutation error handler.
    // MutationCache.onError always runs and is never overridden by per-mutation onError.
    // Strategy: if errors[] is present (field validation errors), each mutation's onError
    // handles them via setError; otherwise (business/server errors) toast the user.
    onError: (error) => {
      if (error instanceof ApiClientError && error.errors.length === 0) {
        toast.error(error.userMessage)
      } else if (!(error instanceof ApiClientError)) {
        toast.error('Request failed')
      }
    },
  }),
})
