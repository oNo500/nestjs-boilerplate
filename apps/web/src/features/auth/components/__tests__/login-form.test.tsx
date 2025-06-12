import { expect, vi } from 'vitest';

import { renderApp, screen, userEvent, waitFor, test } from '@/testing/test-utils';

import LoginForm from '../login-form';

// mock useRouter

test('用户输入后可提交表单并调用登录', async () => {
  const onSuccess = vi.fn();

  renderApp(<LoginForm onSuccess={onSuccess} />);
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), '123456');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));
  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});
