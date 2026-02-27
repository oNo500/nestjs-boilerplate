import { faker } from '@faker-js/faker/locale/en'
import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'

import type { QueryParams } from '@/features/scaffold/types'
import type { components } from '@/types/openapi'

type Article = components['schemas']['ArticleResponseDto']
type CreateArticleDto = components['schemas']['CreateArticleDto']
type UpdateArticleDto = components['schemas']['UpdateArticleDto']

const BASE = env.API_URL

const NOT_FOUND = HttpResponse.json(
  { type: 'about:blank', title: 'Not Found', status: 404, errors: [] },
  { status: 404 },
)

const AUTHORS = ['Alice', 'Bob', 'Charlie']
const CATEGORIES = ['tech', 'design', 'product', 'other'] as const
const STATUSES = ['draft', 'published', 'archived'] as const

const MOCK_ARTICLES: Article[] = Array.from({ length: 10 }, (_, i) => {
  const status = faker.helpers.arrayElement(STATUSES)
  const createdAt = faker.date.between({ from: '2025-01-01', to: '2025-02-01' }).toISOString()
  return {
    id: String(i + 1),
    title: faker.lorem.sentence({ min: 4, max: 8 }).replace('.', ''),
    content: faker.lorem.paragraphs(2),
    slug: faker.lorem.slug(4),
    tags: faker.helpers.arrayElements(['DDD', 'Architecture', 'React', 'NestJS', 'TypeScript'], { min: 0, max: 3 }),
    category: faker.helpers.arrayElement(CATEGORIES),
    status,
    author: faker.helpers.arrayElement(AUTHORS),
    viewCount: status === 'draft' ? 0 : faker.number.int({ min: 100, max: 3000 }),
    isPinned: faker.datatype.boolean({ probability: 0.2 }),
    publishedAt: status === 'published' ? createdAt : null,
    createdAt,
    updatedAt: createdAt,
  }
})

let nextId = MOCK_ARTICLES.length + 1

function queryArticles(params: QueryParams): { data: Article[], total: number } {
  let filtered = [...MOCK_ARTICLES]
  if (params.title) filtered = filtered.filter((a) => a.title.includes(params.title!))
  if (params.status) filtered = filtered.filter((a) => a.status === params.status)
  if (params.category) filtered = filtered.filter((a) => a.category === params.category)
  const total = filtered.length
  const current = params.current ?? 1
  const pageSize = params.pageSize ?? 10
  return { data: filtered.slice((current - 1) * pageSize, current * pageSize), total }
}

export const articlesHandlers = [
  http.get(`${BASE}/api/articles/paginated`, ({ request }) => {
    const url = new URL(request.url)
    const current = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const title = url.searchParams.get('title') ?? undefined
    const status = url.searchParams.get('status') ?? undefined
    const category = url.searchParams.get('category') ?? undefined

    const { data, total } = queryArticles({ current, pageSize, title, status, category })
    return HttpResponse.json({
      object: 'list',
      data,
      page: current,
      pageSize,
      total,
      hasMore: current * pageSize < total,
    })
  }),

  http.post(`${BASE}/api/articles`, async ({ request }) => {
    const dto = (await request.json()) as CreateArticleDto
    const now = new Date().toISOString()
    const article: Article = {
      id: String(nextId++),
      title: dto.title,
      content: dto.content,
      slug: faker.lorem.slug(4),
      tags: [],
      category: dto.category ?? 'other',
      status: 'draft',
      author: dto.author ?? '',
      viewCount: 0,
      isPinned: dto.isPinned ?? false,
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    MOCK_ARTICLES.push(article)
    return HttpResponse.json(article, { status: 201 })
  }),

  http.put(`${BASE}/api/articles/:id`, async ({ params, request }) => {
    const id = params.id as string
    const dto = (await request.json()) as UpdateArticleDto
    const index = MOCK_ARTICLES.findIndex((a) => a.id === id)
    if (index === -1) return NOT_FOUND
    const updated: Article = { ...MOCK_ARTICLES[index]!, ...dto, updatedAt: new Date().toISOString() }
    MOCK_ARTICLES[index] = updated
    return HttpResponse.json(updated)
  }),

  http.delete(`${BASE}/api/articles/:id`, ({ params }) => {
    const id = params.id as string
    const index = MOCK_ARTICLES.findIndex((a) => a.id === id)
    if (index === -1) return NOT_FOUND
    MOCK_ARTICLES.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
