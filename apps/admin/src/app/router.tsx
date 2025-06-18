import { RouterProvider, createBrowserRouter, redirect, useRouteError } from 'react-router';

import { ErrorFallback } from '@/components/errors/error-fallback';
import BaseLayout from '@/components/layouts/base-layout';
import { authStore } from '@/auth/auth-store';

const RouterErrorBoundary = () => {
  const error = useRouteError();
  return <ErrorFallback error={error} resetErrorBoundary={() => window.location.reload()} />;
};

const Placeholder = async () => ({
  Component: (await import('@/features/home/components/placeholder')).default,
});

const requireAuth = async () => {
  if (!authStore.getState().isAuthenticated) {
    throw redirect('/login');
  }
};

const router = createBrowserRouter([
  {
    path: '/',
    ErrorBoundary: RouterErrorBoundary,
    HydrateFallback: () => null,
    Component: BaseLayout,
    handle: { title: 'Dashboard' },
    loader: requireAuth,
    children: [
      {
        path: '/',
        handle: { title: 'Overview', parent: 'Dashboard' },
        lazy: async () => ({
          Component: (await import('@/app/routes/home')).default,
        }),
      },
      {
        path: '/analytics',
        handle: { title: 'Analytics', parent: 'Dashboard' },
        lazy: Placeholder,
      },
      {
        path: '/genesis',
        handle: { title: 'Genesis', parent: 'Models' },
        lazy: Placeholder,
      },
      {
        path: '/explorer',
        handle: { title: 'Explorer', parent: 'Models' },
      },
      {
        path: '/quantum',
        handle: { title: 'Quantum', parent: 'Models' },
        lazy: Placeholder,
      },
      {
        path: '/general',
        handle: { title: 'General', parent: 'Settings' },
        lazy: Placeholder,
      },
      {
        path: '/team',
        handle: { title: 'Team', parent: 'Settings' },
        lazy: Placeholder,
      },
      {
        path: '/billing',
        handle: { title: 'Billing', parent: 'Settings' },
        lazy: Placeholder,
      },
      {
        path: '/limits',
        handle: { title: 'Limits', parent: 'Settings' },
        lazy: Placeholder,
      },
    ],
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

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
