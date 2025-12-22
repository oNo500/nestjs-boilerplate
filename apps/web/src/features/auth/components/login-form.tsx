'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/ui/field'
import { Input } from '@workspace/ui/components/ui/input'
import { Button } from '@workspace/ui/components/ui/button'
import { Spinner } from '@workspace/ui/components/ui/spinner'

import { useRouter } from 'next/navigation'
import { Link } from '@/components/link'
import { appPaths } from '@/config/app-paths'

import { $api } from '@/lib/fetch-client'
import { toast } from 'sonner'
import { loginSchema, type LoginFormData } from '../schemas'

const LoginForm = () => {
  const router = useRouter()
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'user@example.com',
      password: 'Pass123456',
    },
  })

  const { mutateAsync, isPending } = $api.useMutation('post', '/api/auth/login')

  const onSubmit = async (data: LoginFormData) => {
    await mutateAsync({ body: data }, {
      onError: (error) => toast.error(error.detail ?? 'Login failed'),
    })
    router.push('/')
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Enter your email"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Enter your password"
                    autoComplete="off"
                    type="password"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="responsive">
          <Button type="submit" form="login-form" disabled={isPending}>
            {isPending && <Spinner />}
            Login
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?
            {' '}
            <Link href={appPaths.auth.register.getHref()}>Sign up</Link>
          </FieldDescription>
        </Field>

      </CardFooter>
    </Card>
  )
}

export { LoginForm }
