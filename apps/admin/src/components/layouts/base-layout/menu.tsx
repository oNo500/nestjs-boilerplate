import { AudioWaveform, Bot, Command, Frame, GalleryVerticalEnd, Home, Map, PieChart, Settings2 } from 'lucide-react';

import { paths } from '@/config/paths';

export const menuData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: paths.home.getHref(),
      icon: Home,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: paths.home.getHref(),
        },
        {
          title: 'Analytics',
          url: paths.home.analytics.getHref(),
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: paths.models.genesis.getHref(),
        },
        {
          title: 'Explorer',
          url: paths.models.explorer.getHref(),
        },
        {
          title: 'Quantum',
          url: paths.models.quantum.getHref(),
        },
      ],
    },

    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: paths.settings.general.getHref(),
        },
        {
          title: 'Team',
          url: paths.settings.team.getHref(),
        },
        {
          title: 'Billing',
          url: paths.settings.billing.getHref(),
        },
        {
          title: 'Limits',
          url: paths.settings.limits.getHref(),
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
};
