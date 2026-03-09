'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet'
import { Textarea } from '@workspace/ui/components/textarea'
import { XIcon } from 'lucide-react'
import { useState, useEffect, startTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateArticle, useUpdateArticle, useAddTag, useRemoveTag } from '@/features/articles/hooks/use-article-mutations'

import type { components } from '@/types/openapi'
import type { KeyboardEvent } from 'react'

type ArticleRow = components['schemas']['ArticleResponseDto']

const CATEGORIES = ['tech', 'design', 'product', 'other'] as const

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.enum(CATEGORIES).optional(),
  author: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ArticleFormSheetProps {
  article?: ArticleRow
  trigger: React.ReactNode
}

export function ArticleFormSheet({ article, trigger }: ArticleFormSheetProps) {
  const [open, setOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [localTags, setLocalTags] = useState<string[]>([])

  const createArticle = useCreateArticle()
  const updateArticle = useUpdateArticle()
  const addTag = useAddTag()
  const removeTag = useRemoveTag()

  const isEdit = !!article

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      category: undefined,
      author: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (article) {
        reset({
          title: article.title,
          content: article.content,
          category: article.category,
          author: article.author,
        })
        startTransition(() => setLocalTags(article.tags))
      } else {
        reset({ title: '', content: '', category: undefined, author: '' })
        startTransition(() => setLocalTags([]))
      }
    }
  }, [open, article, reset])

  function onSubmit(values: FormValues) {
    if (isEdit) {
      updateArticle.mutate(
        {
          params: { path: { id: article.id } },
          body: { title: values.title, content: values.content, category: values.category, author: values.author },
        },
        { onSuccess: () => setOpen(false) },
      )
    } else {
      createArticle.mutate(
        { body: { title: values.title, content: values.content, category: values.category, author: values.author } },
        {
          onSuccess: () => {
            setOpen(false)
            reset()
          },
        },
      )
    }
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const tag = tagInput.trim()
    if (!tag || localTags.includes(tag)) return

    if (isEdit) {
      addTag.mutate(
        { params: { path: { id: article.id } }, body: { tag } },
        { onSuccess: () => setLocalTags((prev) => [...prev, tag]) },
      )
    } else {
      setLocalTags((prev) => [...prev, tag])
    }
    setTagInput('')
  }

  function handleRemoveTag(tag: string) {
    if (isEdit) {
      removeTag.mutate(
        { params: { path: { id: article.id, tag } } },
        { onSuccess: () => setLocalTags((prev) => prev.filter((t) => t !== tag)) },
      )
    } else {
      setLocalTags((prev) => prev.filter((t) => t !== tag))
    }
  }

  const isPending = createArticle.isPending || updateArticle.isPending

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger nativeButton={false} render={<span>{trigger}</span>} />
      <SheetContent side="right" className="w-full sm:max-w-md! lg:max-w-xl! overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Article' : 'Create Article'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4 pb-4">
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input id="title" placeholder="Article title" {...register('title')} />
              <FieldError errors={errors.title ? [errors.title] : []} />
            </Field>

            <Field data-invalid={!!errors.content}>
              <FieldLabel htmlFor="content">Content</FieldLabel>
              <Textarea
                id="content"
                rows={8}
                placeholder="Article content..."
                {...register('content')}
              />
              <FieldError errors={errors.content ? [errors.content] : []} />
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="author">Author</FieldLabel>
              <Input id="author" placeholder="Author name" {...register('author')} />
            </Field>

            <Field>
              <FieldLabel htmlFor="tags">Tags</FieldLabel>
              <Input
                id="tags"
                placeholder="Type tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              {localTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {localTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </Field>
          </FieldGroup>

          <SheetFooter>
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button type="submit" disabled={isSubmitting || isPending}>
              {isPending ? 'Saving...' : (isEdit ? 'Save' : 'Create')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
