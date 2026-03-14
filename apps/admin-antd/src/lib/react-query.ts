import { MutationCache, QueryClient } from '@tanstack/react-query'

import { ApiClientError } from './api-error'
import { notification } from './notification'

import type { DefaultOptions } from '@tanstack/react-query'

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiClientError
        && (error.status === 401 || error.status === 403 || error.status === 404)
      ) {
        return false
      }
      return failureCount < 1
    },
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
}

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error instanceof ApiClientError) {
        // Field validation errors are not toasted; handled at the component layer via setFields
        if (error.errors.length > 0) return

        // System errors (5xx)
        if (error.status >= 500) {
          notification.error('Server error, please try again later')
          return
        }

        // Business errors (e.g. EMAIL_EXISTS, 409, INVALID_CREDENTIALS, etc.)
        notification.error(error.userMessage)
        return
      }

      // Network errors or other unknown errors
      notification.error('Network error, please retry')
    },
  }),
  defaultOptions: queryConfig,
})
