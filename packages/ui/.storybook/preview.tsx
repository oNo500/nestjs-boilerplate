import { theme } from './theme';

import type { Preview } from '@storybook/react-vite';

import '../src/styles/globals.css';

const preview: Preview = {
  initialGlobals: {
    backgrounds: { value: 'dark' },
  },
  parameters: {
    layout: 'centered',
    docs: {
      autodocs: 'tag',
      theme: theme,
    },
    options: {
      storySort: {
        order: ['Intro', 'Colors', '*'],
      },
    },
    // previewTabs: { 'storybook/docs/panel': { index: -1 } },
    backgrounds: {
      options: {
        // 👇 Default options
        dark: { name: 'Dark', value: '#333' },
        light: { name: 'Light', value: '#F7F9F2' },
        // 👇 Add your own
        // maroon: { name: 'Maroon', value: '#400' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },

  decorators: [
    (story, context: { globals: { backgrounds?: { value?: string } } }) => {
      const selectedTheme = context.globals.backgrounds?.value ?? theme.base;
      return <div className={selectedTheme}>{story()}</div>;
    },
  ],
};

export default preview;
