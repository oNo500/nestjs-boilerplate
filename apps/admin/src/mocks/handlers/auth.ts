import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import type { APIResponse, LoginData } from '@/types/api';

export const authHandlers = [
  http.post(`${env.API_URL}/api/auth/register`, ({ request }) => {
    return HttpResponse.json(
      {
        success: true,
        message: '注册成功',
        data: {
          user: {
            id: '1',
            name: 'testuser',
            email: 'testuser@example.com',
          },
          token: 'mock-jwt-token',
          expiresIn: 1000,
        },
      } as APIResponse<LoginData>,
      {
        headers: {
          'Set-Cookie': 'token=mock-jwt-token; Path=/; HttpOnly; SameSite=Strict',
        },
      },
    );
  }),
  http.post(`${env.API_URL}/api/auth/login`, async ({ request }) => {
    const { email } = await request.clone().json();
    return HttpResponse.json(
      {
        success: true,
        message: '登录成功',
        data: {
          user: {
            id: '1',
            name: email.split('@')[0],
            email,
            avatar: 'https://github.com/shadcn.png',
          },
          token: 'mock-jwt-token',
          expiresIn: 1000,
        },
      } as APIResponse<LoginData>,
      {
        headers: {
          'Set-Cookie': 'token=mock-jwt-token; Path=/; HttpOnly; SameSite=Strict',
        },
      },
    );
  }),
  http.post(`${env.API_URL}/api/auth/logout`, ({ request }) => {
    return HttpResponse.json(
      {
        success: true,
        message: '退出成功',
      },
      {
        headers: {
          'Set-Cookie': 'token=; Path=/; HttpOnly; SameSite=Strict',
        },
      },
    );
  }),
];
