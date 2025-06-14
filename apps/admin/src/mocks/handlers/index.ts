import { HttpResponse, delay, http } from 'msw';

import { authHandlers } from './auth';
import { userHandlers } from './user';

export const handlers = [
  // http.all('*', async () => {
  //   await delay(1000);
  // }),
  ...authHandlers,
  ...userHandlers,
  http.get('/api/mock', () => {
    return HttpResponse.json({ message: 'test' });
  }),
];
