import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'

import { MainLayout } from '@/components/layout'
import { Loading } from '@/components/loading'
import { LoginForm, RegisterForm, ProtectedRoute } from '@/features/auth'

// Dashboard
const DashboardAnalysisPage = lazy(() =>
  import('./routes/dashboard/analysis').then((m) => ({ default: m.DashboardAnalysisPage })),
)
const DashboardMonitorPage = lazy(() =>
  import('./routes/dashboard/monitor').then((m) => ({ default: m.DashboardMonitorPage })),
)
const DashboardWorkplacePage = lazy(() =>
  import('./routes/dashboard/workplace').then((m) => ({ default: m.DashboardWorkplacePage })),
)

// Form pages
const ScaffoldFormPage = lazy(() =>
  import('./routes/form/basic').then((m) => ({ default: m.ScaffoldFormPage })),
)
const FormStepPage = lazy(() =>
  import('./routes/form/step').then((m) => ({ default: m.FormStepPage })),
)
const FormAdvancedPage = lazy(() =>
  import('./routes/form/advanced').then((m) => ({ default: m.FormAdvancedPage })),
)

// List pages
const ListSearchArticlesPage = lazy(() =>
  import('./routes/list/search/articles').then((m) => ({ default: m.ListSearchArticlesPage })),
)
const ListSearchProjectsPage = lazy(() =>
  import('./routes/list/search/projects').then((m) => ({ default: m.ListSearchProjectsPage })),
)
const ListSearchApplicationsPage = lazy(() =>
  import('./routes/list/search/applications').then((m) => ({
    default: m.ListSearchApplicationsPage,
  })),
)
const ScaffoldListPage = lazy(() =>
  import('./routes/list/table').then((m) => ({ default: m.ScaffoldListPage })),
)
const ListBasicPage = lazy(() =>
  import('./routes/list/basic').then((m) => ({ default: m.ListBasicPage })),
)
const ListTableListPage = lazy(() =>
  import('./routes/list/table-list').then((m) => ({ default: m.ListTableListPage })),
)
const ScaffoldDetailPage = lazy(() =>
  import('./routes/list/table-detail').then((m) => ({ default: m.ScaffoldDetailPage })),
)

// Detail pages
const ProfileBasicPage = lazy(() =>
  import('./routes/profile/basic').then((m) => ({ default: m.ProfileBasicPage })),
)
const ProfileAdvancedPage = lazy(() =>
  import('./routes/profile/advanced').then((m) => ({ default: m.ProfileAdvancedPage })),
)

// Account pages
const ProfilePage = lazy(() =>
  import('./routes/account/center').then((m) => ({ default: m.ProfilePage })),
)
const AccountSettingsPage = lazy(() =>
  import('./routes/account/settings').then((m) => ({ default: m.AccountSettingsPage })),
)

// Result pages
const ResultSuccessPage = lazy(() =>
  import('./routes/result/success').then((m) => ({ default: m.ResultSuccessPage })),
)
const ResultFailPage = lazy(() =>
  import('./routes/result/fail').then((m) => ({ default: m.ResultFailPage })),
)

// System management
const UsersPage = lazy(() =>
  import('./routes/system/users').then((m) => ({ default: m.UsersPage })),
)
const UserDetailPage = lazy(() =>
  import('./routes/system/user-detail').then((m) => ({ default: m.UserDetailPage })),
)
const RolesPage = lazy(() =>
  import('./routes/system/roles').then((m) => ({ default: m.RolesPage })),
)
const AuditLogsPage = lazy(() =>
  import('./routes/system/audit-logs').then((m) => ({ default: m.AuditLogsPage })),
)

// Foundation
const FoundationComponentsPage = lazy(() =>
  import('./routes/foundation/components').then((m) => ({ default: m.FoundationComponentsPage })),
)
const FoundationIconsPage = lazy(() =>
  import('./routes/foundation/icons').then((m) => ({ default: m.FoundationIconsPage })),
)

// Exception pages
const Error403Page = lazy(() =>
  import('./routes/exception/403').then((m) => ({ default: m.Error403Page })),
)
const Error500Page = lazy(() =>
  import('./routes/exception/500').then((m) => ({ default: m.Error500Page })),
)
const ErrorEmptyPage = lazy(() =>
  import('./routes/exception/empty').then((m) => ({ default: m.ErrorEmptyPage })),
)
const NotFoundPage = lazy(() =>
  import('./routes/not-found').then((m) => ({ default: m.NotFoundPage })),
)

const DocsPage = lazy(() => import('./routes/docs').then((m) => ({ default: m.DocsPage })))

const wrap = (Page: React.ComponentType) => (
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard/analysis" replace />,
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/register',
    element: <RegisterForm />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        element: <Navigate to="/dashboard/analysis" replace />,
      },
      {
        path: 'dashboard/analysis',
        element: wrap(DashboardAnalysisPage),
      },
      {
        path: 'dashboard/monitor',
        element: wrap(DashboardMonitorPage),
      },
      {
        path: 'dashboard/workplace',
        element: wrap(DashboardWorkplacePage),
      },
      // Form pages
      {
        path: 'form/basic',
        element: wrap(ScaffoldFormPage),
      },
      {
        path: 'form/step',
        element: wrap(FormStepPage),
      },
      {
        path: 'form/advanced',
        element: wrap(FormAdvancedPage),
      },
      // List pages
      {
        path: 'list/search/articles',
        element: wrap(ListSearchArticlesPage),
      },
      {
        path: 'list/search/projects',
        element: wrap(ListSearchProjectsPage),
      },
      {
        path: 'list/search/applications',
        element: wrap(ListSearchApplicationsPage),
      },
      {
        path: 'list/table',
        element: wrap(ScaffoldListPage),
      },
      {
        path: 'list/table/:id',
        element: wrap(ScaffoldDetailPage),
      },
      {
        path: 'list/basic',
        element: wrap(ListBasicPage),
      },
      {
        path: 'list/table-list',
        element: wrap(ListTableListPage),
      },
      // Detail pages
      {
        path: 'profile/basic',
        element: wrap(ProfileBasicPage),
      },
      {
        path: 'profile/advanced',
        element: wrap(ProfileAdvancedPage),
      },
      // Account pages
      {
        path: 'account/center',
        element: wrap(ProfilePage),
      },
      {
        path: 'account/settings',
        element: wrap(AccountSettingsPage),
      },
      // Result pages
      {
        path: 'result/success',
        element: wrap(ResultSuccessPage),
      },
      {
        path: 'result/fail',
        element: wrap(ResultFailPage),
      },
      // System management
      {
        path: 'system',
        element: (
          <ProtectedRoute requireRoles={['ADMIN']}>
            <Suspense fallback={<Loading />}>
              <Navigate to="/system/users" replace />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'system/users',
        element: (
          <Suspense fallback={<Loading />}>
            <ProtectedRoute requireRoles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'system/users/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <ProtectedRoute requireRoles={['ADMIN']}>
              <UserDetailPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'system/roles',
        element: (
          <Suspense fallback={<Loading />}>
            <ProtectedRoute requireRoles={['ADMIN']}>
              <RolesPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'system/audit-logs',
        element: (
          <Suspense fallback={<Loading />}>
            <ProtectedRoute requireRoles={['ADMIN']}>
              <AuditLogsPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      // Foundation
      {
        path: 'foundation/components',
        element: wrap(FoundationComponentsPage),
      },
      {
        path: 'foundation/icons',
        element: wrap(FoundationIconsPage),
      },
      // Exception pages
      {
        path: 'exception/403',
        element: wrap(Error403Page),
      },
      {
        path: 'exception/404',
        element: wrap(NotFoundPage),
      },
      {
        path: 'exception/500',
        element: wrap(Error500Page),
      },
      {
        path: 'exception/empty',
        element: wrap(ErrorEmptyPage),
      },
      // Docs
      {
        path: 'docs',
        element: wrap(DocsPage),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<Loading />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])
