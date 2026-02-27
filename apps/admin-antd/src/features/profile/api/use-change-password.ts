import { useMutation } from '@tanstack/react-query'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'

import { fetchClient } from '@/lib/api'

export function useChangePassword() {
  const { t } = useTranslation('profile')
  return useMutation({
    mutationFn: async ({ body }: { body: { currentPassword: string, newPassword: string } }) => {
      await fetchClient.POST('/api/profile/change-password' as never, { body } as never)
    },
    onSuccess: () => {
      void message.success(t('changePassword.successMessage'))
    },
  })
}
