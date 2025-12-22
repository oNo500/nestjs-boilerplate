/** @type {import('@svgr/core').Config} */
export default {
  typescript: true,
  jsxRuntime: 'automatic',
  icon: true,
  svgo: true,
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
      'removeXMLNS',
    ],
  },
  replaceAttrValues: {
    '#000': 'currentColor',
    '#000000': 'currentColor',
    black: 'currentColor',
  },
}
