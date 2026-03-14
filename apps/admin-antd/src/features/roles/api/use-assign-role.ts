import { useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'

import { $api } from '@/lib/api'

export function useAssignRole() {
  const queryClient = useQueryClient()

  return $api.useMutation('put', '/api/users/{id}/role', {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['get', '/api/users'] })
      void message.success('Role updated successfully')
    },
  })
}
