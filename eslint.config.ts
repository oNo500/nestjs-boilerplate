import { config as baseConfig } from '@repo/lint-config/base';

const config = [
  ...baseConfig,
  {
    ignores: ['apps/**', 'packages/**'],
  },
];

export default config;
