import { env } from '@/config/env';

import type { ErrorInfo } from 'react';

export function logError(error: Error, errorInfo?: ErrorInfo) {
  // 开发环境详细日志
  if (env.MODE === 'development') {
    console.group('🚨 Error Boundary');
    console.error('Error:', error);
    if (errorInfo) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
    console.groupEnd();
  }

  // 生产环境错误上报
  if (env.MODE === 'production') {
    // 这里可以集成 Sentry 或其他错误监控服务
    // 或者发送到您的后端错误收集接口
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // 静默处理错误上报失败
    });
  }
}
