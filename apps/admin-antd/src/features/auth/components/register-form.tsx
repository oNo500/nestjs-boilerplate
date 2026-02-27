import { LoginForm as ProLoginForm, ProFormText } from '@ant-design/pro-components'
import { useMutation } from '@tanstack/react-query'
import { theme } from 'antd'
import { User, Mail, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('auth')

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
            title={t('register.title')}
            subTitle={t('register.subTitle')}
            submitter={{
              searchConfig: {
                submitText: t('register.submit'),
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
                placeholder: t('placeholder.username'),
                autoComplete: 'username',
              }}
              rules={[
                { required: true, message: t('validation.usernameRequired') },
                { min: 2, message: t('validation.usernameMin') },
                { max: 50, message: t('validation.usernameMax') },
                {
                  pattern: /^[\w-]+$/,
                  message: t('validation.usernamePattern'),
                },
              ]}
            />

            <ProFormText
              name="email"
              fieldProps={{
                size: 'large',
                prefix: <Mail size={16} />,
                placeholder: t('placeholder.email'),
                autoComplete: 'email',
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
                autoComplete: 'new-password',
              }}
              rules={[
                { required: true, message: t('validation.passwordRequired') },
                { min: 8, message: t('validation.passwordMin') },
              ]}
            />

            <ProFormText.Password
              name="confirmPassword"
              fieldProps={{
                size: 'large',
                prefix: <KeyRound size={16} />,
                placeholder: t('placeholder.confirmPassword'),
                autoComplete: 'new-password',
              }}
              dependencies={['password']}
              rules={[
                { required: true, message: t('validation.confirmPasswordRequired') },
                ({ getFieldValue }) => ({
                  validator(_rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error(t('validation.passwordMismatch')))
                  },
                }),
              ]}
            />
          </ProLoginForm>

          <div style={{ textAlign: 'center', marginTop: '-10px' }}>
            <span style={{ color: token.colorTextSecondary }}>{t('register.hasAccount')}</span>
            <Link to="/login" style={{ marginLeft: 4 }}>
              {t('register.loginNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
