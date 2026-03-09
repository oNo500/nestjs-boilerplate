'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { cn } from '@workspace/ui/lib/utils'
import { GalleryVerticalEndIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'

import { appPaths } from '@/config/app-paths'
import { env } from '@/config/env'
import { $api } from '@/lib/api'
import { setToken, setRefreshToken, setUser } from '@/lib/token'

const loginSchema = z.object({
  email: z.email('Enter a valid email address.').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter()

  const { control, handleSubmit, setError } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const loginMutation = $api.useMutation('post', '/api/auth/login', {
    onSuccess: (data) => {
      setToken(data.accessToken)
      setRefreshToken(data.refreshToken)
      setUser(data.user)
      router.push(appPaths.dashboard.href)
    },
    onError: (error) => {
      for (const e of error.errors ?? []) {
        if (e.field) setError(e.field as keyof LoginFormValues, { message: e.message })
      }
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ body: data })
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
            <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
            <FieldDescription>
              Don&apos;t have an account?
              {' '}
              <Link href={appPaths.auth.register.getHref()}>Sign up</Link>
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
                  placeholder="admin@example.com / user@example.com"
                  aria-invalid={fieldState.invalid}
                  autoComplete="email"
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
                  placeholder="12345678"
                  aria-invalid={fieldState.invalid}
                  autoComplete="current-password"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field>
            <Button type="submit" disabled={loginMutation.isPending} className="w-full">
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

          <Field className="grid gap-4 sm:grid-cols-2">
            <a
              href={`${env.NEXT_PUBLIC_API_URL}/api/auth/oauth/google`}
              className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </a>
            <a
              href={`${env.NEXT_PUBLIC_API_URL}/api/auth/oauth/github`}
              className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                <path
                  d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
                  fill="currentColor"
                />
              </svg>
              Continue with GitHub
            </a>
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
