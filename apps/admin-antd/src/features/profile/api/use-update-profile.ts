import { useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'

import { fetchClient } from '@/lib/api'

import type { Profile, UpdateProfileDto } from '@/features/profile/types'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('profile')

  return useMutation({
    mutationFn: async ({ body }: { body: UpdateProfileDto }) => {
      const { data } = await fetchClient.PATCH('/api/profile' as never, { body } as never)
      return data as unknown as Profile
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      void message.success(t('messages.updateSuccess'))
    },
  })
}
