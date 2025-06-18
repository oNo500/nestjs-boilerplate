import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
// import onlyWarn from 'eslint-plugin-only-warn'; // TODO: 区域环境，只在生产环境启用
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import gitignore from 'eslint-config-flat-gitignore';
import pluginImportX from 'eslint-plugin-import-x';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import turboPlugin from 'eslint-plugin-turbo';
import globals from 'globals';
import tseslint, { configs as tseslintConfigs } from 'typescript-eslint';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

// =========================================
// 基础 ESLint 配置
// =========================================
const eslintConfig = [
  {
    name: 'base/eslint/recommended',
    files: ['**/*.js?(x)', '**/*.mjs'],
    ...js.configs.recommended,
  },
] as FlatConfig.Config[];

// =========================================
// TypeScript ESLint 配置
// =========================================
const tseslintConfig = tseslint.config(
  {
    name: 'base/typescript-eslint/recommended',
    files: ['**/*.mjs', '**/*.ts?(x)'],
    extends: [...tseslintConfigs.recommended] as FlatConfig.ConfigArray,
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2023,
        ...globals.jest,
      },
      parserOptions: {
        // 启用类型检查功能
        projectService: true,

        project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],

        // it is recommended to keep version warnings turned on
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // 对 .mjs 文件禁用类型检查
    files: ['**/*.mjs'],
    ...tseslintConfigs.disableTypeChecked,
    name: 'base/typescript-eslint/disable-type-checked',
  },
);

// =========================================
// 忽略文件配置
// =========================================
const ignoresConfig = [
  {
    name: 'base/eslint/ignores',
    // ignores 选项需要在单独的配置对象中 替代 .eslintignore 文件
    ignores: [...gitignore().ignores],
  },
] as FlatConfig.Config[];

// =========================================
// Import 配置
// =========================================
const importConfig = [
  pluginImportX.flatConfigs.recommended,
  pluginImportX.flatConfigs.typescript,
  pluginImportX.flatConfigs.react,
  {
    name: 'base/import/recommended',
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'import-x/no-anonymous-default-export': 'warn', // 警告匿名默认导出
      // 'import-x/order': 'off', // 禁用可能与 Prettier 冲突的规则
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'object', 'type'],
          'newlines-between': 'always',
        },
      ],
      'import-x/first': 'error', // import 语句必须放在文件最前面
      'import-x/newline-after-import': 'error', // import 语句后必须空一行
      'import-x/no-duplicates': 'error', // 禁止重复导入
      'import-x/no-unresolved': 'error', // 禁止未解析的导入
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
        }),
      ],
    },
    // settings: {
    //   'import/resolver': {
    //     typescript: true,
    //     node: true,
    //   },
    // },
  },
] as FlatConfig.Config[];

// =========================================
// turbo配置
// =========================================
const turboConfig = [
  {
    name: 'base/turbo/recommended',
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
] as FlatConfig.Config[];

// =========================================
// prettier
// =========================================
const prettierConfig = [
  pluginPrettierRecommended as FlatConfig.Config,
  {
    name: 'base/prettier/custom',
    rules: {
      'prettier/prettier': [
        'error',
        {
          printWidth: 120,
        },
      ],
    },
  },
] as FlatConfig.Config[];

export const config = [
  ...eslintConfig,
  ...tseslintConfig,
  ...importConfig,
  ...turboConfig,
  ...ignoresConfig,
  ...prettierConfig,
] satisfies FlatConfig.Config[];
