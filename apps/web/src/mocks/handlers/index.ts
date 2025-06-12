import { HttpResponse, http } from 'msw';

import { authHandlers } from './auth';
import { userHandlers } from './user';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  http.get('/api/mock', () => {
    return HttpResponse.json({ message: 'test' });
  }),
];
