'use client'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { $api } from '@/lib/api'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return $api.useMutation('post', '/api/users', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['get', '/api/users'] })
      toast.success('User created successfully')
    },
    onError: () => {
      toast.error('Failed to create user')
    },
  })
}
