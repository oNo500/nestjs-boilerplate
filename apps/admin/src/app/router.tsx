import { RouterProvider, createBrowserRouter, useRouteError } from 'react-router';

import { ErrorFallback } from '@/components/errors/error-fallback';

// React Router 错误边界组件
const RouterErrorBoundary = () => {
  const error = useRouteError();
  return <ErrorFallback error={error} resetErrorBoundary={() => window.location.reload()} />;
};

const router = createBrowserRouter([
  {
    path: '/',
    ErrorBoundary: RouterErrorBoundary,
    HydrateFallback: () => null,
    lazy: async () => ({
      Component: (await import('@/app/routes/home')).default,
    }),
  },
  {
    path: '/login',
    HydrateFallback: () => null,
    lazy: async () => ({
      Component: (await import('@/app/routes/login')).default,
    }),
  },
  {
    path: '/register',
    HydrateFallback: () => null,
    lazy: async () => ({
      Component: (await import('@/app/routes/register')).default,
    }),
  },
  {
    path: '*',
    HydrateFallback: () => null,
    lazy: async () => ({
      Component: (await import('@/app/routes/not-found')).default,
    }),
  },
]);
const LoadingFallback = () => <div>加载中...</div>;

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
