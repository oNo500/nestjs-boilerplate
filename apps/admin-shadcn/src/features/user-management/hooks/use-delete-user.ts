'use client'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { $api } from '@/lib/api'

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return $api.useMutation('delete', '/api/users/{id}', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['get', '/api/users'] })
      toast.success('User deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete user')
    },
  })
}
