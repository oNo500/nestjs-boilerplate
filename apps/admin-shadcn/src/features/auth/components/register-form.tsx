'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { cn } from '@workspace/ui/lib/utils'
import { GalleryVerticalEndIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'

import { appPaths } from '@/config/app-paths'
import { $api } from '@/lib/api'
import { setRefreshToken, setToken, setUser } from '@/lib/token'

const registerSchema = z.object({
  email: z.email('Enter a valid email address.').min(1, 'Email is required'),
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters.')
    .max(30, 'Name must be at most 30 characters.')
    .regex(/^[\w-]+$/, 'Only letters, digits, underscores, and hyphens allowed.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Must contain both letters and digits.'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter()

  const { control, handleSubmit, setError } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', name: '', password: '' },
  })

  const registerMutation = $api.useMutation('post', '/api/auth/register', {
    onSuccess: (data) => {
      setToken(data.accessToken)
      setRefreshToken(data.refreshToken)
      setUser(data.user)
      router.push(appPaths.dashboard.href)
    },
    onError: (error) => {
      for (const e of error.errors ?? []) {
        if (e.field) setError(e.field as keyof RegisterFormValues, { message: e.message })
      }
    },
  })

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({ body: data })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Create an account</h1>
            <FieldDescription>
              Already have an account?
              {' '}
              <Link href={appPaths.auth.login.getHref()}>Sign in</Link>
            </FieldDescription>
          </div>

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="m@example.com"
                  aria-invalid={fieldState.invalid}
                  autoComplete="email"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="john_doe"
                  aria-invalid={fieldState.invalid}
                  autoComplete="username"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  aria-invalid={fieldState.invalid}
                  autoComplete="new-password"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field>
            <Button type="submit" disabled={registerMutation.isPending} className="w-full">
              {registerMutation.isPending ? 'Creating account...' : 'Create account'}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our
        {' '}
        <a href="#">Terms of Service</a>
        {' '}
        and
        {' '}
        <a href="#">Privacy Policy</a>
        .
      </FieldDescription>
    </div>
  )
}
