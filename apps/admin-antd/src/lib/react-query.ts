import { MutationCache, QueryClient } from '@tanstack/react-query'

import { i18next } from '@/config/i18n'

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
        // Field validation errors (errors containing a field property) are not toasted; bound to the form at the component layer
        const hasFieldErrors = error.errors.some((e) => e.field)
        if (hasFieldErrors) return

        // System errors (5xx)
        if (error.status >= 500) {
          notification.error(i18next.t('common:api.serverError'))
          return
        }

        // Business errors (errors not bound to a field, e.g. EMAIL_EXISTS, 409, etc.)
        notification.error(error.errors[0]?.message ?? error.title)
        return
      }

      // Network errors or other unknown errors
      notification.error(i18next.t('common:api.networkError'))
    },
  }),
  defaultOptions: queryConfig,
})
