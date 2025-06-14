export const paths = {
  github: {
    path: 'https://github.com/oNo500/nestjs-boilerplate',
  },
  home: {
    path: '/',
    getHref: () => '/',
    history: {
      path: '/history',
      getHref: () => '/history',
    },
    analytics: {
      path: '/analytics',
      getHref: () => '/analytics',
    },
  },
  models: {
    genesis: {
      path: '/genesis',
      getHref: () => '/genesis',
    },
    explorer: {
      path: '/explorer',
      getHref: () => '/explorer',
    },
    quantum: {
      path: '/quantum',
      getHref: () => '/quantum',
    },
  },
  settings: {
    general: {
      path: '/general',
      getHref: () => '/general',
    },
    team: {
      path: '/team',
      getHref: () => '/team',
    },
    billing: {
      path: '/billing',
      getHref: () => '/billing',
    },
    limits: {
      path: '/limits',
      getHref: () => '/limits',
    },
  },
  auth: {
    register: {
      path: '/register',
      getHref: (redirectTo?: string | null) =>
        `/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    login: {
      path: '/login',
      getHref: (redirectTo?: string | null) =>
        `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },
};
