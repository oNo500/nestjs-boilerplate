'use client'

import { useQueryClient } from '@tanstack/react-query'

import { $api } from '@/lib/api'

export function useBanUser() {
  const queryClient = useQueryClient()

  return $api.useMutation('patch', '/api/users/{id}', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['get', '/api/users'] })
    },
  })
}
