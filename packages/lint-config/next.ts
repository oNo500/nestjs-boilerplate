// @ts-expect-error 此包没有类型定义
import pluginNext from '@next/eslint-plugin-next';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

import { config as baseConfig } from './base.js';

const nextJsConfig = [
  {
    name: 'base/next/config',
    // 插件配置
    plugins: {
      react: pluginReact, // React 核心插件
      'jsx-a11y': pluginJsxA11y, // 可访问性检查
      'react-hooks': pluginReactHooks, // React Hooks 规则
      '@next/next': pluginNext, // Next.js 特定规则
    },
    rules: {
      // React 相关规则
      ...pluginReact.configs.recommended.rules,
      ...pluginReact.configs['jsx-runtime'].rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules, // Next.js 严格模式
      ...pluginJsxA11y.configs.strict.rules,

      // 自定义规则调整
      // react
      'react/no-unknown-property': 'off', // 禁用未知属性检查
      'react/react-in-jsx-scope': 'off', // 无需导入 React
      'react/prop-types': 'off', // 禁用 PropTypes 检查
      'react/jsx-no-target-blank': 'off', // 允许 target="_blank"

      // 可访问性警告
      'jsx-a11y/alt-text': [
        'warn',
        {
          elements: ['img'],
          img: ['Image'],
        },
      ],
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
    },
    // 全局设置
    settings: {
      react: {
        version: 'detect', // 自动检测 React 版本
      },
    },
  },
] as FlatConfig.Config[];

export const config = [...baseConfig, ...nextJsConfig] satisfies FlatConfig.Config[];
