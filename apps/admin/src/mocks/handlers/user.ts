import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

export const userHandlers = [
  http.get(`${env.API_URL}/api/user/me`, async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json(
        {
          success: false,
          message: '未登录',
          data: null,
        },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        id: '1',
        name: 'testuser',
        email: 'testuser@example.com',
        avatar: 'https://github.com/shadcn.png',
      },
    });
  }),
];
