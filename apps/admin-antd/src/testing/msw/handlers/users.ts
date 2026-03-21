import { faker } from '@faker-js/faker/locale/en'
import { HttpResponse } from 'msw'
import { createOpenApiHttp } from 'openapi-msw'

import { env } from '@/config/env'

import type { User, CreateUserDto, UpdateUserDto, UserListResponse, GetUsersParams } from '@/features/users/types'
import type { paths } from '@workspace/api-types'

const MOCK_USERS: User[] = Array.from({ length: 30 }, (_, i) => {
  const past = faker.date.between({ from: '2025-01-01', to: '2025-02-01' })
  const isBanned = faker.datatype.boolean({ probability: 0.15 })
  return {
    id: faker.string.uuid(),
    name: faker.internet.username(),
    displayName: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: faker.datatype.boolean({ probability: 0.8 }),
    image: null,
    role: i < 2 ? 'ADMIN' : 'USER',
    banned: isBanned,
    banReason: isBanned ? faker.helpers.arrayElement(['Violated community guidelines', 'Posted prohibited content', 'Account anomaly', 'Malicious activity']) : null,
    createdAt: past.toISOString(),
    updatedAt: faker.date.between({ from: past, to: new Date() }).toISOString(),
  }
})

function mockQueryUsers(params: GetUsersParams): UserListResponse {
  let filtered = [...MOCK_USERS]

  if (params.search) {
    const search = params.search.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search)
        || u.email.toLowerCase().includes(search)
        || (u.displayName?.toLowerCase().includes(search) ?? false),
    )
  }

  if (params.role) {
    filtered = filtered.filter((u) => u.role === params.role)
  }

  if (params.banned !== undefined) {
    filtered = filtered.filter((u) => u.banned === params.banned)
  }

  if (params.sortBy) {
    const key = params.sortBy as keyof User
    const dir = params.sortOrder === 'desc' ? -1 : 1
    filtered.sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (av === null || av === undefined) return dir
      if (bv === null || bv === undefined) return -dir
      if (av < bv) return -dir
      if (av > bv) return dir
      return 0
    })
  }

  const total = filtered.length
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return { object: 'list', data, total, page, pageSize, hasMore: start + pageSize < total }
}

function mockGetUser(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id)
}

function mockCreateUser(dto: CreateUserDto): User {
  const now = new Date().toISOString()
  const user: User = {
    id: faker.string.uuid(),
    name: dto.name ?? dto.email.split('@')[0] ?? dto.email,
    displayName: dto.displayName ?? null,
    email: dto.email,
    emailVerified: false,
    image: null,
    role: dto.role ?? 'USER',
    banned: false,
    banReason: null,
    createdAt: now,
    updatedAt: now,
  }
  MOCK_USERS.push(user)
  return user
}

function mockUpdateUser(id: string, dto: UpdateUserDto): User | undefined {
  const index = MOCK_USERS.findIndex((u) => u.id === id)
  if (index === -1) return undefined
  const existing = MOCK_USERS[index]!
  const updated: User = { ...existing, ...dto, updatedAt: new Date().toISOString() }
  MOCK_USERS[index] = updated
  return updated
}

function mockDeleteUser(id: string): boolean {
  const index = MOCK_USERS.findIndex((u) => u.id === id)
  if (index === -1) return false
  MOCK_USERS.splice(index, 1)
  return true
}

function mockAssignRole(id: string, role: string): User | undefined {
  const index = MOCK_USERS.findIndex((u) => u.id === id)
  if (index === -1) return undefined
  const existing = MOCK_USERS[index]!
  const updated: User = { ...existing, role, updatedAt: new Date().toISOString() }
  MOCK_USERS[index] = updated
  return updated
}

const http = createOpenApiHttp<paths>({ baseUrl: env.API_URL })

export const usersHandlers = [
  http.get('/api/users', ({ request, query, response }) => {
    const page = Number(query.get('page') ?? 1)
    const pageSize = Number(query.get('pageSize') ?? 10)
    const search = query.get('search') ?? undefined
    const role = query.get('role') ?? undefined
    const bannedRaw = query.get('banned')
    const banned = bannedRaw === null ? undefined : bannedRaw === 'true'
    const qs = new URL(request.url).searchParams
    const sortBy = qs.get('sortBy') ?? undefined
    const sortOrderRaw = qs.get('sortOrder')
    const sortOrder = sortOrderRaw === 'asc' || sortOrderRaw === 'desc' ? sortOrderRaw : undefined
    const result = mockQueryUsers({ page, pageSize, search, role, banned, sortBy, sortOrder })
    return response(200).json(result)
  }),

  http.get('/api/users/{id}', ({ params, response }) => {
    const user = mockGetUser(params.id)
    if (!user) return response(404).empty()
    return response(200).json(user)
  }),

  http.post('/api/users', async ({ request, response }) => {
    const body = await request.json()
    const user = mockCreateUser(body)
    return response(201).json(user)
  }),

  http.patch('/api/users/{id}', async ({ params, request, response }) => {
    const body = await request.json()
    const user = mockUpdateUser(params.id, body)
    if (!user) return response(404).empty()
    return response(200).json(user)
  }),

  http.delete('/api/users/{id}', ({ params, response }) => {
    const deleted = mockDeleteUser(params.id)
    if (!deleted) return response(404).empty()
    return new HttpResponse(null, { status: 204 })
  }),

  http.put('/api/users/{id}/role', async ({ params, request, response }) => {
    const body = await request.json()
    const user = mockAssignRole(params.id, body.role)
    if (!user) return response(404).empty()
    return response(200).json(user)
  }),
]
