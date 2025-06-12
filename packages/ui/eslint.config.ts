// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';
import { config as reactInternalConfig } from '@repo/lint-config/react-internal';

const config = [
  ...reactInternalConfig,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off', // 由于本包不是 Next.js 应用，没有 pages 目录，需关闭该规则以避免报错
    },
  },
  ...storybook.configs['flat/recommended'],
];
export default config;
