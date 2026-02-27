import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchClient } from '@/lib/api'

import type { Article, ArticleListResponse, CreateArticleDto, QueryParams, UpdateArticleDto } from '@/features/scaffold/types'

export function useArticles(params: QueryParams) {
  return useQuery<ArticleListResponse>({
    queryKey: ['articles', params],
    queryFn: async () => {
      const { data } = await fetchClient.GET('/api/articles/paginated', {
        params: {
          query: {
            page: params.current,
            pageSize: params.pageSize,
          },
        },
      })
      return data as ArticleListResponse
    },
  })
}

export function useArticleById(id: string) {
  return useQuery<Article>({
    queryKey: ['articles', id],
    queryFn: async () => {
      const { data } = await fetchClient.GET('/api/articles/{id}', {
        params: { path: { id } },
      })
      return data!
    },
  })
}

export function useCreateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateArticleDto) => {
      const { data } = await fetchClient.POST('/api/articles', { body })
      return data!
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}

export function useUpdateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string, body: UpdateArticleDto }) => {
      const { data } = await fetchClient.PUT('/api/articles/{id}', {
        params: { path: { id } },
        body,
      })
      return data!
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}

export function useDeleteArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchClient.DELETE('/api/articles/{id}', {
        params: { path: { id } },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}
