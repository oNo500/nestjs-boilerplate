'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateUser } from '@/features/user-management/hooks/use-create-user'

const schema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const createUser = useCreateUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', name: '' },
  })

  function onSubmit(values: FormValues) {
    createUser.mutate(
      { body: { email: values.email, password: values.password, name: values.name } },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(
        <Button size="sm">
          <PlusIcon className="mr-1 h-4 w-4" />
          New User
        </Button>
      )}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register('email')}
              />
              <FieldError errors={errors.email ? [errors.email] : []} />
            </Field>

            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name (optional)</FieldLabel>
              <Input
                id="name"
                placeholder="Full name"
                {...register('name')}
              />
              <FieldError errors={errors.name ? [errors.name] : []} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                {...register('password')}
              />
              <FieldError errors={errors.password ? [errors.password] : []} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createUser.isPending}>
              {createUser.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
