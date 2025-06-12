export interface APIResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// 错误响应类型
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
  name?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}
