import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';

import { config as baseConfig } from './base.js';

const viteConfig = [
  {
    name: 'base/vite/config',
    plugins: {
      react: pluginReact, // React 核心插件
      'jsx-a11y': pluginJsxA11y, // 可访问性检查
      'react-hooks': pluginReactHooks, // React Hooks 规则
      'react-refresh': pluginReactRefresh,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReact.configs['jsx-runtime'].rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginJsxA11y.configs.strict.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/no-unknown-property': 'off', // 禁用未知属性检查
      'react/react-in-jsx-scope': 'off', // 无需导入 React
      'react/prop-types': 'off', // 禁用 PropTypes 检查
      'react/jsx-no-target-blank': 'off', // 允许 target="_blank"
    },
    settings: {
      react: {
        version: 'detect', // 自动检测 React 版本
      },
    },
  },
] as FlatConfig.Config[];

export const config = [...baseConfig, ...viteConfig] satisfies FlatConfig.Config[];
