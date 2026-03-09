import { http, HttpResponse } from 'msw'

import type { components } from '@/types/openapi'

type LoginDto = components['schemas']['LoginDto']
type LoginResponseDto = components['schemas']['LoginResponseDto']
type ProblemDetailsDto = components['schemas']['ProblemDetailsDto']

export const authHandlers = [
  http.post<never, LoginDto>(
    'http://localhost:3000/api/auth/login',
    async ({ request }) => {
      const body = await request.json()

      if (body.email === 'user@example.com' && body.password === 'Pass123456') {
        return HttpResponse.json<LoginResponseDto>({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: { id: 'user-1', email: 'user@example.com', role: 'admin' },
        })
      }

      return HttpResponse.json<ProblemDetailsDto>(
        { type: 'about:blank', title: 'Unauthorized', status: 401, detail: 'Invalid credentials.' },
        { status: 401 },
      )
    },
  ),
]
