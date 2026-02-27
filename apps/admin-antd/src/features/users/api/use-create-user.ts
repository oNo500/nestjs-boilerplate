import { useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'

import { $api } from '@/lib/api'

export function useCreateUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('users')

  return $api.useMutation('post', '/api/users', {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['get', '/api/users'] })
      void message.success(t('actions.createSuccess'))
    },
  })
}
