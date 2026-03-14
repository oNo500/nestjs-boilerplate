import { useMutation } from '@tanstack/react-query'
import { message } from 'antd'

import { fetchClient } from '@/lib/api'

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ body }: { body: { currentPassword: string, newPassword: string } }) => {
      await fetchClient.POST('/api/profile/change-password' as never, { body } as never)
    },
    onSuccess: () => {
      void message.success('Password changed successfully, please log in again')
    },
  })
}
