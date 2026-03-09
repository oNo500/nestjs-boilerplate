/**
 * E2E authentication helpers
 *
 * Uses the real login flow to obtain access tokens,
 * ensuring end-to-end authenticity.
 */
import { createRequest } from './create-request'

import type { INestApplication } from '@nestjs/common'
import type { Test as SuperTestType } from 'supertest'
import type TestAgent from 'supertest/lib/agent'

/**
 * Register and login a test user, returning the access token.
 * Emails should use the e2ePrefix from globalThis to ensure namespace isolation.
 */
export async function registerAndLogin(
  app: INestApplication,
  email: string,
  password: string,
  name = 'Test User',
): Promise<string> {
  await createRequest(app)
    .post('/api/auth/register')
    .send({ email, password, name })

  const loginRes = await createRequest(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200)

  const body = loginRes.body as { accessToken: string }
  return body.accessToken
}

/**
 * Attach the Bearer token to a SuperTest agent chain.
 */
export function withToken(
  req: TestAgent<SuperTestType>,
  token: string,
): TestAgent<SuperTestType> {
  return req.set('Authorization', `Bearer ${token}`) as unknown as TestAgent<SuperTestType>
}
