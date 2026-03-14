import { useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'

import { $api } from '@/lib/api'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return $api.useMutation('post', '/api/users', {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['get', '/api/users'] })
      void message.success('User created successfully')
    },
  })
}
