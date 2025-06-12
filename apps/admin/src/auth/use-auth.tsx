import { toast } from '@repo/ui/components/sonner';
import { useMutation, useQuery } from '@tanstack/react-query';

import { paths } from '@/config/paths';
import { apiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';

import { authStore } from './auth-store';

import type { APIResponse, ApiError, LoginData, User } from '@/types/api';

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
  const { login } = authStore();
  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginData> => {
      const response = await apiClient.post<APIResponse<LoginData>>('/api/auth/login', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success(`Login success, welcome back ${data.user.name || data.user.email}!`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Please check your email and password');
    },
  });
};

// 注册
export const useRegister = () => {
  const { login } = authStore();
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<LoginData> => {
      const response = await apiClient.post<APIResponse<LoginData>>('/api/auth/register', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
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
      return response.data.data;
    },
  });
};

// 登出
export const useLogout = () => {
  const { logout } = authStore();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/api/auth/logout');
    },
    onMutate: () => {
      logout();
      queryClient.clear();
    },
    onSuccess: () => {
      toast.info('Logged out');
    },
    onError: (error: ApiError) => {
      logout();
      queryClient.clear();
      toast.error(error.message || 'An error occurred during logout');
    },
    onSettled: () => {
      window.location.href = paths.auth.login.path;
    },
  });
};
