import { LoginForm as ProLoginForm, ProFormText, ProFormCaptcha } from '@ant-design/pro-components'
import { useMutation } from '@tanstack/react-query'
import { Tabs, theme } from 'antd'
import { Mail, KeyRound, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import Logo from '@/components/layout/logo'
import { useAuthStore } from '@/features/auth/stores/use-auth-store'
import { fetchClient } from '@/lib/api'

import type { LoginCredentials } from '@/features/auth/types'

type LoginType = 'account' | 'phone'

export function LoginForm() {
  const [loginType, setLoginType] = useState<LoginType>('account')
  const navigate = useNavigate()
  const authStore = useAuthStore()
  const { token } = theme.useToken()

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await fetchClient.POST('/api/auth/login', { body: credentials })
      return data!
    },
    onSuccess: (data) => {
      authStore.login(data.user, data.accessToken, data.refreshToken)
      void navigate('/dashboard', { replace: true })
    },
  })

  const handleSubmit = async (values: LoginCredentials) => {
    if (loginType === 'account') {
      await loginMutation.mutateAsync(values)
    }
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
            onFinish={async (values: LoginCredentials) => {
              await handleSubmit(values)
            }}
          >
            <Tabs
              centered
              activeKey={loginType}
              onChange={(key) => setLoginType(key as LoginType)}
              items={[
                {
                  key: 'account',
                  label: 'Account Login',
                },
                {
                  key: 'phone',
                  label: 'Phone Login',
                },
              ]}
            />

            {loginType === 'account' && (
              <>
                <ProFormText
                  name="email"
                  fieldProps={{
                    size: 'large',
                    prefix: <Mail size={16} />,
                    placeholder: 'admin@example.com / user@example.com',
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
                  }}
                  rules={[
                    { required: true, message: 'Please enter your password' },
                    { min: 8, message: 'Password must be at least 8 characters' },
                  ]}
                />
              </>
            )}

            {loginType === 'phone' && (
              <>
                <ProFormText
                  name="phone"
                  fieldProps={{
                    size: 'large',
                    prefix: <Smartphone size={16} />,
                    placeholder: 'Please enter your phone number',
                  }}
                  rules={[
                    { required: true, message: 'Please enter your phone number' },
                    { pattern: /^1\d{10}$/, message: 'Invalid phone number format' },
                  ]}
                />

                <ProFormCaptcha
                  name="captcha"
                  fieldProps={{
                    size: 'large',
                    prefix: <KeyRound size={16} />,
                    placeholder: 'Please enter the captcha',
                  }}
                  captchaProps={{
                    size: 'large',
                  }}
                  captchaTextRender={(timing, count) => {
                    if (timing) {
                      return `Resend in ${count}s`
                    }
                    return 'Get Captcha'
                  }}
                  rules={[{ required: true, message: 'Please enter the captcha' }]}
                  onGetCaptcha={async (_phone) => {
                    // Mock send captcha, to be implemented
                  }}
                />
              </>
            )}

            <div style={{ marginBottom: 24 }}>
              <a style={{ float: 'right' }}>Forgot Password</a>
            </div>
          </ProLoginForm>
          <div style={{ textAlign: 'center', marginTop: '-10px' }}>
            <span style={{ color: token.colorTextSecondary }}>Don&apos;t have an account?</span>
            <Link to="/register" style={{ marginLeft: 4 }}>
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
