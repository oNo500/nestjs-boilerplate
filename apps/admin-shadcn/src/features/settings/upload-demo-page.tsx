'use client'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'
import {
  CheckCircle2Icon,
  FileIcon,
  FileTextIcon,
  RotateCcwIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { env } from '@/config/env'
import { getToken } from '@/lib/token'

import type { ChangeEvent, DragEvent } from 'react'

const MAX_FILES = 5
const MAX_SIZE_MB = 10

interface FileProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  url?: string
  error?: string
  previewUrl?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileItem({
  entry,
  onRemove,
  onRetry,
}: {
  entry: FileProgress
  onRemove: () => void
  onRetry: () => void
}) {
  const isImage = entry.file.type.startsWith('image/')
  const isPdf = entry.file.type === 'application/pdf'

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
        {isImage && entry.previewUrl
          ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob URL, not compatible with next/image
              <img
                src={entry.previewUrl}
                alt={entry.file.name}
                className="size-full object-cover"
              />
            )
          : (isPdf
              ? (
                  <FileTextIcon className="size-6 text-red-500" />
                )
              : (
                  <FileIcon className="size-6 text-muted-foreground" />
                ))}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-medium">{entry.file.name}</span>
          {entry.status !== 'uploading' && (
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove file"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{formatFileSize(entry.file.size)}</p>

        {entry.status === 'uploading' && (
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Uploading...</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {entry.progress}
                %
              </span>
            </div>
            <Progress value={entry.progress} />
          </div>
        )}

        {entry.status === 'done' && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2Icon className="size-3.5 text-green-500 shrink-0" />
            {entry.url
              ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline truncate"
                  >
                    View uploaded file
                  </a>
                )
              : (
                  <span className="text-xs text-green-600">Upload complete</span>
                )}
          </div>
        )}

        {entry.status === 'error' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-destructive">{entry.error}</span>
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              <RotateCcwIcon className="size-3" />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function UploadDemoPage() {
  const [fileList, setFileList] = useState<FileProgress[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | null) {
    if (!files) return
    const remaining = MAX_FILES - fileList.length
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_FILES} files allowed`)
      return
    }

    const toAdd = [...files].slice(0, remaining).filter((f) => {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name} exceeds ${MAX_SIZE_MB}MB limit`)
        return false
      }
      return true
    })

    setFileList((prev) => [
      ...prev,
      ...toAdd.map((file) => ({
        file,
        progress: 0,
        status: 'pending' as const,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      })),
    ])
  }

  function removeFile(fileName: string) {
    setFileList((prev) => {
      const entry = prev.find((f) => f.file.name === fileName)
      if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl)
      return prev.filter((f) => f.file.name !== fileName)
    })
  }

  function clearCompleted() {
    setFileList((prev) => prev.filter((f) => f.status !== 'done'))
  }

  async function uploadFile(index: number) {
    const entry = fileList[index]
    if (!entry || entry.status === 'uploading') return

    setFileList((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: 'uploading', progress: 0 } : f)),
    )

    const formData = new FormData()
    formData.append('file', entry.file)

    const token = getToken()

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setFileList((prev) =>
            prev.map((f, i) => (i === index ? { ...f, progress: pct } : f)),
          )
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText) as { url: string }
          setFileList((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, status: 'done', progress: 100, url: res.url } : f,
            ),
          )
        } else {
          setFileList((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, status: 'error', error: 'Upload failed' } : f,
            ),
          )
        }
        resolve()
      })

      xhr.addEventListener('error', () => {
        setFileList((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: 'error', error: 'Network error' } : f,
          ),
        )
        resolve()
      })

      xhr.open('POST', `${env.NEXT_PUBLIC_API_URL}/api/upload/file`)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(formData)
    })
  }

  async function retryFile(fileName: string) {
    const index = fileList.findIndex((f) => f.file.name === fileName)
    if (index === -1) return
    setFileList((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: 'pending', error: undefined, progress: 0 } : f)),
    )
    await uploadFile(index)
  }

  async function uploadAll() {
    const pending = fileList
      .map((f, i) => ({ ...f, index: i }))
      .filter((f) => f.status === 'pending')

    await Promise.all(pending.map((f) => uploadFile(f.index)))
  }

  const pendingCount = fileList.filter((f) => f.status === 'pending').length
  const doneCount = fileList.filter((f) => f.status === 'done').length
  const errorCount = fileList.filter((f) => f.status === 'error').length

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-0">
      <div>
        <h1 className="text-2xl font-bold">Upload Demo</h1>
        <p className="text-sm text-muted-foreground">
          Multi-file upload with real-time progress tracking, preview, and retry support.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Up to
            {' '}
            {MAX_FILES}
            {' '}
            files, max
            {' '}
            {MAX_SIZE_MB}
            MB each. Images and PDF only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-all ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <UploadIcon className="size-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Drag & drop files here, or click to select</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Up to
                {' '}
                {MAX_FILES}
                {' '}
                files ·
                {' '}
                {MAX_SIZE_MB}
                MB max each
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {['PNG', 'JPG', 'WebP', 'PDF'].map((fmt) => (
                <Badge key={fmt} variant="outline" className="text-xs">
                  {fmt}
                </Badge>
              ))}
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleChange}
          />

          {fileList.length > 0 && (
            <div className="space-y-2">
              {fileList.map((entry) => (
                <FileItem
                  key={entry.file.name}
                  entry={entry}
                  onRemove={() => removeFile(entry.file.name)}
                  onRetry={() => retryFile(entry.file.name)}
                />
              ))}
            </div>
          )}

          {fileList.length > 0 && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <p className="text-xs text-muted-foreground">
                {[
                  doneCount > 0 && `${doneCount} uploaded`,
                  pendingCount > 0 && `${pendingCount} pending`,
                  errorCount > 0 && `${errorCount} failed`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <div className="flex gap-2">
                {doneCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCompleted}>
                    Clear done
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setFileList([])}>
                  Clear all
                </Button>
                <Button size="sm" onClick={uploadAll} disabled={pendingCount === 0}>
                  Upload
                  {' '}
                  {pendingCount}
                  {' '}
                  file
                  {pendingCount === 1 ? '' : 's'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
