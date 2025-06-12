import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

export const userHandlers = [
  http.get(`${env.API_URL}/api/auth/me`, async ({ request }) => {
    const cookie = request.headers.get('cookie') || '';
    const isLoggedIn = cookie.includes('token=mock-jwt-token');
    if (!isLoggedIn) {
      return new HttpResponse(JSON.stringify({ success: false, message: '未登录', data: null }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return HttpResponse.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        id: '1',
        name: 'testuser',
        email: 'testuser@example.com',
      },
    });
  }),
];
