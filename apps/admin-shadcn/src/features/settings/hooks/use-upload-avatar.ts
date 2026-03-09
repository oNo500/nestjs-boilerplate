'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { env } from '@/config/env'
import { $api } from '@/lib/api'
import { getToken } from '@/lib/token'

export function useUploadAvatar(onSuccess?: (avatarUrl: string) => void) {
  const [isUploading, setIsUploading] = useState(false)

  const updateProfile = $api.useMutation('patch', '/api/profile')

  async function uploadAvatar(file: File) {
    setIsUploading(true)
    try {
      const token = getToken()
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/upload/file`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const { url } = (await res.json()) as { url: string }

      await updateProfile.mutateAsync({
        body: { avatarUrl: url },
      })

      toast.success('Avatar updated successfully')
      onSuccess?.(url)
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadAvatar, isUploading }
}
