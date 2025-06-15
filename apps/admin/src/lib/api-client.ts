import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { authStore } from '@/auth/auth-store';
import { env } from '@/config/env';

import type { ApiResponse } from '@/types/api';

export const instance: AxiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 1000 * 10,
});

instance.interceptors.request.use(attachRequestHeaders);
instance.interceptors.response.use(onFulfilled, onRejected);

async function request<T>(config: Parameters<AxiosInstance['request']>[0]): Promise<T> {
  const response = await instance.request<ApiResponse<T>>(config);
  const res = response.data;

  if (res.data) {
    return res.data;
  } else {
    throw res.error;
  }
}

const apiClient = {
  get: <T>(url: string, config?: Parameters<AxiosInstance['get']>[1]) => request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, data?: unknown, config?: Parameters<AxiosInstance['post']>[2]) =>
    request<T>({ ...config, method: 'POST', url, data }),
};

export default apiClient;

function attachRequestHeaders(config: InternalAxiosRequestConfig) {
  config.headers = config.headers || {};

  config.headers.Accept = 'application/json';

  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.withCredentials = true;
  return config;
}

function onFulfilled(response: AxiosResponse<ApiResponse<unknown>>) {
  if (response.data.data) return response;
  return Promise.reject(response.data.error);
}
function onRejected(error: AxiosError<ApiResponse<unknown>>) {
  return Promise.reject(
    error.response?.data?.error || {
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'UNKNOWN_ERROR',
    },
  );
}
