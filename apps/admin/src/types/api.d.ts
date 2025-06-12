// 错误响应类型
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
  name?: string;
}
export interface APIResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginData {
  user: User;
  token: string;
  expiresIn: number;
}
