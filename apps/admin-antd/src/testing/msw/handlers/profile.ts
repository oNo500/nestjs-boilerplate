import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'

import type { Profile, UpdateProfileDto } from '@/features/profile/types'

const MOCK_PROFILES: Profile[] = [
  {
    userId: 'user-1',
    displayName: 'Admin',
    avatarUrl: null,
    bio: 'System administrator, responsible for daily operations and user management.',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

function getProfile(userId: string): Profile {
  const profile = MOCK_PROFILES.find((p) => p.userId === userId)
  if (profile) return profile
  const now = new Date().toISOString()
  return { userId, displayName: null, avatarUrl: null, bio: null, createdAt: now, updatedAt: now }
}

function updateProfile(userId: string, dto: UpdateProfileDto): Profile {
  const index = MOCK_PROFILES.findIndex((p) => p.userId === userId)
  const now = new Date().toISOString()
  if (index === -1) {
    const created: Profile = {
      userId,
      displayName: dto.displayName ?? null,
      avatarUrl: dto.avatarUrl ?? null,
      bio: dto.bio ?? null,
      createdAt: now,
      updatedAt: now,
    }
    MOCK_PROFILES.push(created)
    return created
  }
  const updated: Profile = { ...MOCK_PROFILES[index]!, ...dto, updatedAt: now }
  MOCK_PROFILES[index] = updated
  return updated
}

export const profileHandlers = [
  http.get(`${env.API_URL}/api/profile`, () => {
    return HttpResponse.json(getProfile('user-1'))
  }),

  http.patch(`${env.API_URL}/api/profile`, async ({ request }) => {
    const body = (await request.json()) as UpdateProfileDto
    return HttpResponse.json(updateProfile('user-1', body))
  }),

  http.post(`${env.API_URL}/api/profile/change-password`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
