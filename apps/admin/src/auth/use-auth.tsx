import { toast } from '@repo/ui/components/sonner';
import { useMutation, useQuery } from '@tanstack/react-query';

import { paths } from '@/config/paths';
import apiClient from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';

import { authStore } from './auth-store';

import type { ApiError, LoginData, User } from '@/types/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}
// 登录
export const useLogin = () => {
  const { login } = authStore();
  return useMutation({
    mutationFn: async (data: LoginRequest) => await apiClient.post<LoginData>('/api/auth/login', data),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      toast.success(`Login success, welcome back ${data.user.name || data.user.email}!`);
    },
    onError: (error: ApiError) => {
      console.log('error', error);
      toast.error(error.message || 'Please check your email and password');
    },
  });
};

export const useRegister = () => {
  const { login } = authStore();
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<LoginData> =>
      await apiClient.post<LoginData>('/api/auth/register', data),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      toast.success('Registration successful, please log in with your new account');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'An error occurred during registration');
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => await apiClient.get<User>('/api/auth/me'),
  });
};

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
