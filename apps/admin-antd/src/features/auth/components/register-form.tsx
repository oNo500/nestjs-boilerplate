import { LoginForm as ProLoginForm, ProFormText } from '@ant-design/pro-components'
import { useMutation } from '@tanstack/react-query'
import { theme } from 'antd'
import { User, Mail, KeyRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import Logo from '@/components/layout/logo'
import { useAuthStore } from '@/features/auth/stores/use-auth-store'
import { fetchClient } from '@/lib/api'

interface RegisterFormValues {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export function RegisterForm() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { token } = theme.useToken()

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const { data } = await fetchClient.POST('/api/auth/register', {
        body: { name: values.username, email: values.email, password: values.password },
      })
      return data!
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      void navigate('/dashboard', { replace: true })
    },
  })

  const handleSubmit = async (values: RegisterFormValues) => {
    await registerMutation.mutateAsync(values)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'auto',
        backgroundColor: token.colorBgContainer,
      }}
    >
      <div
        style={{
          flex: 1,
          padding: '32px 0',
        }}
      >
        <div>
          <ProLoginForm
            contentStyle={{
              minWidth: 328,
              maxWidth: '75vw',
            }}
            logo={<Logo style={{ fontSize: 48 }} />}
            title="Admin Template"
            subTitle="Enterprise Admin System"
            submitter={{
              searchConfig: {
                submitText: 'Register',
              },
            }}
            onFinish={async (values: RegisterFormValues) => {
              await handleSubmit(values)
            }}
          >
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <User size={16} />,
                placeholder: 'Please enter your username',
                autoComplete: 'username',
              }}
              rules={[
                { required: true, message: 'Please enter your username' },
                { min: 2, message: 'Username must be at least 2 characters' },
                { max: 50, message: 'Username must be at most 50 characters' },
                {
                  pattern: /^[\w-]+$/,
                  message: 'Username can only contain letters, numbers, underscores and hyphens',
                },
              ]}
            />

            <ProFormText
              name="email"
              fieldProps={{
                size: 'large',
                prefix: <Mail size={16} />,
                placeholder: 'admin@example.com / user@example.com',
                autoComplete: 'email',
              }}
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
            />

            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <KeyRound size={16} />,
                placeholder: 'password: 12345678',
                autoComplete: 'new-password',
              }}
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            />

            <ProFormText.Password
              name="confirmPassword"
              fieldProps={{
                size: 'large',
                prefix: <KeyRound size={16} />,
                placeholder: 'Please enter your password again',
                autoComplete: 'new-password',
              }}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please enter your password again' },
                ({ getFieldValue }) => ({
                  validator(_rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('The two passwords do not match'))
                  },
                }),
              ]}
            />
          </ProLoginForm>

          <div style={{ textAlign: 'center', marginTop: '-10px' }}>
            <span style={{ color: token.colorTextSecondary }}>Already have an account?</span>
            <Link to="/login" style={{ marginLeft: 4 }}>
              Login Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
