import type { components } from '@/types/openapi'

export interface QueryParams {
  current?: number
  pageSize?: number
  title?: string
  status?: string
  category?: string
}

export type Article = components['schemas']['ArticleResponseDto']
export type CreateArticleDto = components['schemas']['CreateArticleDto']
export type UpdateArticleDto = components['schemas']['UpdateArticleDto']

export interface ArticleListResponse {
  object: 'list'
  data: Article[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}
