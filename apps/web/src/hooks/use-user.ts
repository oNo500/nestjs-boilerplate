import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';

import type { APIResponse, User } from '@/types/api';

export const useUser = () => {
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => apiClient.get<APIResponse<User>>('/api/auth/me'),
    select: (data) => data.data,
  });

  return { userData, isLoading };
};

export const prefetchUser = queryClient.prefetchQuery({
  queryKey: ['user'],
  queryFn: async () =>
    apiClient.get<APIResponse<User>>('/api/auth/me', {
      cache: 'no-cache',
    }),
});
