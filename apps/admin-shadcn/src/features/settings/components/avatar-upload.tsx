'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar'
import { Loader2Icon, CameraIcon } from 'lucide-react'
import { useRef, useState } from 'react'

import { useUploadAvatar } from '@/features/settings/hooks/use-upload-avatar'

type Props = {
  currentAvatarUrl?: string | null
  fallbackText?: string
}

export function AvatarUpload({ currentAvatarUrl, fallbackText = 'U' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { uploadAvatar, isUploading } = useUploadAvatar((url) => {
    setPreviewUrl(url)
  })

  function handleClick() {
    if (!isUploading) {
      inputRef.current?.click()
    }
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    await uploadAvatar(file)
  }

  const avatarSrc = previewUrl ?? currentAvatarUrl ?? undefined

  return (
    <div className="relative w-fit cursor-pointer group" onClick={handleClick}>
      <Avatar size="lg" className="size-20">
        <AvatarImage src={avatarSrc} />
        <AvatarFallback className="text-lg">{fallbackText.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUploading
          ? (
              <Loader2Icon className="size-5 text-white animate-spin" />
            )
          : (
              <CameraIcon className="size-5 text-white" />
            )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
