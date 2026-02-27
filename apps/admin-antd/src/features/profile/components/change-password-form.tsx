import { ModalForm, ProFormText } from '@ant-design/pro-components'
import { Button } from 'antd'
import { KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useChangePassword } from '@/features/profile/api/use-change-password'

import type { ChangePasswordDto } from '@/features/profile/types'

export function ChangePasswordForm() {
  const changeMutation = useChangePassword()
  const { t } = useTranslation('profile')

  const handleFinish = async (values: ChangePasswordDto): Promise<boolean> => {
    try {
      await changeMutation.mutateAsync({
        body: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      })
      return true
    } catch {
      return false
    }
  }

  return (
    <ModalForm
      title={t('changePassword.title')}
      trigger={<Button icon={<KeyRound size={14} />}>{t('changePassword.trigger')}</Button>}
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={handleFinish}
    >
      <ProFormText.Password
        name="currentPassword"
        label={t('fields.currentPassword')}
        placeholder={t('form.currentPasswordPlaceholder')}
        rules={[{ required: true, message: t('validation.currentPasswordRequired') }]}
      />
      <ProFormText.Password
        name="newPassword"
        label={t('fields.newPassword')}
        placeholder={t('form.newPasswordPlaceholder')}
        rules={[
          { required: true, message: t('validation.newPasswordRequired') },
          { min: 8, message: t('validation.newPasswordMin') },
        ]}
      />
      <ProFormText.Password
        name="confirmPassword"
        label={t('fields.confirmPassword')}
        placeholder={t('form.confirmPasswordPlaceholder')}
        rules={[
          { required: true, message: t('validation.confirmPasswordRequired') },
          ({ getFieldValue }) => ({
            validator(_, value: unknown) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error(t('validation.passwordMismatch')))
            },
          }),
        ]}
      />
    </ModalForm>
  )
}
