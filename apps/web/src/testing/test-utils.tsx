import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import { expect, test as vitestTest } from 'vitest';

import { AppProviders } from '@/components/providers';
import { worker } from '@/mocks/browser';

export const waitForLoadingToFinish = () =>
  waitFor(() => expect(screen.getByTestId(/page-ready/i)).toBeInTheDocument(), {
    timeout: 4000,
  });

export const renderApp = async (ui: React.ReactElement, { user, ...renderOptions }: Record<string, unknown> = {}) => {
  const returnValue = {
    ...rtlRender(ui, {
      wrapper: AppProviders,
      ...renderOptions,
    }),
    user: null,
  };
  await waitForLoadingToFinish();
  return returnValue;
};

export const test = vitestTest.extend({
  worker: [
    async ({}, use) => {
      // Start the worker before the test.
      await worker.start();

      // Expose the worker object on the test's context.
      await use(worker);

      // Remove any request handlers added in individual test cases.
      // This prevents them from affecting unrelated tests.
      worker.resetHandlers();
    },
    {
      auto: true,
    },
  ],
});

export * from '@testing-library/react';
export { userEvent, rtlRender };
