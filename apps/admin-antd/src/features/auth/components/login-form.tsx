import { LoginForm as ProLoginForm, ProFormText, ProFormCaptcha } from '@ant-design/pro-components'
import { useMutation } from '@tanstack/react-query'
import { Tabs, theme } from 'antd'
import { Mail, KeyRound, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('auth')

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
            title={t('login.title')}
            subTitle={t('login.subTitle')}
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
                  label: t('login.accountTab'),
                },
                {
                  key: 'phone',
                  label: t('login.phoneTab'),
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
                    placeholder: t('placeholder.email'),
                  }}
                  rules={[
                    { required: true, message: t('validation.emailRequired') },
                    { type: 'email', message: t('validation.emailInvalid') },
                  ]}
                />

                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <KeyRound size={16} />,
                    placeholder: t('placeholder.password'),
                  }}
                  rules={[
                    { required: true, message: t('validation.passwordRequired') },
                    { min: 8, message: t('validation.passwordMin') },
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
                    placeholder: t('placeholder.phone'),
                  }}
                  rules={[
                    { required: true, message: t('validation.phoneRequired') },
                    { pattern: /^1\d{10}$/, message: t('validation.phonePattern') },
                  ]}
                />

                <ProFormCaptcha
                  name="captcha"
                  fieldProps={{
                    size: 'large',
                    prefix: <KeyRound size={16} />,
                    placeholder: t('placeholder.captcha'),
                  }}
                  captchaProps={{
                    size: 'large',
                  }}
                  captchaTextRender={(timing, count) => {
                    if (timing) {
                      return t('captcha.resend', { count })
                    }
                    return t('captcha.get')
                  }}
                  rules={[{ required: true, message: t('validation.captchaRequired') }]}
                  onGetCaptcha={async (_phone) => {
                    // Mock send captcha, to be implemented
                  }}
                />
              </>
            )}

            <div style={{ marginBottom: 24 }}>
              <a style={{ float: 'right' }}>{t('login.forgotPassword')}</a>
            </div>
          </ProLoginForm>
          <div style={{ textAlign: 'center', marginTop: '-10px' }}>
            <span style={{ color: token.colorTextSecondary }}>{t('login.noAccount')}</span>
            <Link to="/register" style={{ marginLeft: 4 }}>
              {t('login.registerNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
