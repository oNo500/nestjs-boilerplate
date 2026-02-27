import { useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'

import { $api } from '@/lib/api'

export function useAssignRole() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('roles')

  return $api.useMutation('put', '/api/users/{id}/role', {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['get', '/api/users'] })
      void message.success(t('actions.updateSuccess'))
    },
  })
}
