import { type FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import { config as baseConfig } from './base.js';

const nestConfig = [
  {
    name: 'base/nest/config',
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
] satisfies FlatConfig.Config[];

export const config = [...baseConfig, ...nestConfig] satisfies FlatConfig.Config[];
