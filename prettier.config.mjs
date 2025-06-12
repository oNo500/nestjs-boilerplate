/** @satisfies {import("prettier").Config} */
const config = {
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  objectWrap: 'preserve',
  plugins: ['prettier-plugin-tailwindcss'],
  // plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  // importOrder: [
  //   '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|timers|tls|tty|url|util|v8|vm|zlib)(/.*)?$',
  //   '^[a-zA-Z]',
  //   '^@/(.*)$',
  //   '^\\.\\.(?!/?$)',
  //   '^\\./(?=.*/)(?!/?$)',
  //   '^\\./?$',
  // ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  // tailwind 相关配置
  tailwindFunctions: ['clsx', 'cn', 'twMerge'],
  // tailwindAttributes: ['className', 'class'],
};

export default config;
