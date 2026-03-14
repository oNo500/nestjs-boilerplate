import { useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'

import { $api } from '@/lib/api'

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return $api.useMutation('delete', '/api/users/{id}', {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['get', '/api/users'] })
      void message.success('User deleted successfully')
    },
  })
}
