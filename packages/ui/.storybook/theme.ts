import { create, themes } from 'storybook/theming';
/**
 * 自定义主题
 * @see https://storybook.js.org/docs/configure/user-interface/theming#create-a-theme-quickstart
 */
export const theme = create({
  base: 'dark',
  //   brandTitle: 'Kit101 UI', // 品牌标题
  //   brandUrl: 'https://kit101.com', // 品牌链接
  //   brandImage: 'https://kit101.com/logo.svg', // 品牌图片
  //   brandTarget: '_self', // 品牌链接打开方式
});
