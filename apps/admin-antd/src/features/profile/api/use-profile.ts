import { useQuery } from '@tanstack/react-query'

import { fetchClient } from '@/lib/api'

import type { Profile } from '@/features/profile/types'

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await fetchClient.GET('/api/profile' as never)
      return data as unknown as Profile
    },
  })
}
