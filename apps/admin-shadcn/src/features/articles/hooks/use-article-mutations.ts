'use client'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { $api } from '@/lib/api'

function invalidateArticles(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['get', '/api/articles/paginated'] })
  void qc.invalidateQueries({ queryKey: ['get', '/api/articles/cursor'] })
  void qc.invalidateQueries({ queryKey: ['get', '/api/articles/all'] })
}

export function useCreateArticle() {
  const queryClient = useQueryClient()
  return $api.useMutation('post', '/api/articles', {
    onSuccess: () => {
      invalidateArticles(queryClient)
      toast.success('Article created')
    },
    onError: () => { toast.error('Failed to create article') },
  })
}

export function useUpdateArticle() {
  const queryClient = useQueryClient()
  return $api.useMutation('put', '/api/articles/{id}', {
    onSuccess: () => {
      invalidateArticles(queryClient)
      toast.success('Article updated')
    },
    onError: () => { toast.error('Failed to update article') },
  })
}

export function useDeleteArticle() {
  const queryClient = useQueryClient()
  return $api.useMutation('delete', '/api/articles/{id}', {
    onSuccess: () => {
      invalidateArticles(queryClient)
      toast.success('Article deleted')
    },
    onError: () => { toast.error('Failed to delete article') },
  })
}

export function usePublishArticle() {
  const queryClient = useQueryClient()
  return $api.useMutation('patch', '/api/articles/{id}/publish', {
    onSuccess: () => {
      invalidateArticles(queryClient)
      toast.success('Article published')
    },
    onError: () => { toast.error('Failed to publish article') },
  })
}

export function useArchiveArticle() {
  const queryClient = useQueryClient()
  return $api.useMutation('patch', '/api/articles/{id}/archive', {
    onSuccess: () => {
      invalidateArticles(queryClient)
      toast.success('Article archived')
    },
    onError: () => { toast.error('Failed to archive article') },
  })
}

export function useAddTag() {
  const queryClient = useQueryClient()
  return $api.useMutation('post', '/api/articles/{id}/tags', {
    onSuccess: () => { invalidateArticles(queryClient) },
    onError: () => { toast.error('Failed to add tag') },
  })
}

export function useRemoveTag() {
  const queryClient = useQueryClient()
  return $api.useMutation('delete', '/api/articles/{id}/tags/{tag}', {
    onSuccess: () => { invalidateArticles(queryClient) },
    onError: () => { toast.error('Failed to remove tag') },
  })
}
