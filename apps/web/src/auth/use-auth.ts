import { toast } from '@repo/ui/components/sonner';
import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';

import type { APIResponse, ApiError, User } from '@/types/api';

// 类型定义
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

// 登录
export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<User> => {
      const response = await apiClient.post<APIResponse<User>>('/api/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Login success, welcome back ${data.name || data.email}!`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Please check your email and password');
    },
  });
};

// 注册
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<User> => {
      const response = await apiClient.post<APIResponse<User>>('/api/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Registration successful, please log in with your new account');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'An error occurred during registration');
    },
  });
};

// 获取当前用户信息
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async (): Promise<User> => {
      const response = await apiClient.get<APIResponse<User>>('/api/auth/me');
      return response.data;
    },
  });
};

// 登出
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/api/auth/logout');
    },
    onSuccess: () => {
      toast.info('Logged out');
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
};
