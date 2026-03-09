'use client'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { $api } from '@/lib/api'

export function useAssignRole() {
  const queryClient = useQueryClient()

  return $api.useMutation('put', '/api/users/{id}/role', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['get', '/api/users'] })
      toast.success('Role updated successfully')
    },
    onError: () => {
      toast.error('Failed to update role')
    },
  })
}
