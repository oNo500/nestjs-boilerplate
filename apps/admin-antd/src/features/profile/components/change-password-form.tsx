import { ModalForm, ProFormText } from '@ant-design/pro-components'
import { Button } from 'antd'
import { KeyRound } from 'lucide-react'

import { useChangePassword } from '@/features/profile/api/use-change-password'

import type { ChangePasswordDto } from '@/features/profile/types'

export function ChangePasswordForm() {
  const changeMutation = useChangePassword()

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
      title="Change Password"
      trigger={<Button icon={<KeyRound size={14} />}>Change Password</Button>}
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={handleFinish}
    >
      <ProFormText.Password
        name="currentPassword"
        label="Current Password"
        placeholder="Please enter current password"
        rules={[{ required: true, message: 'Please enter current password' }]}
      />
      <ProFormText.Password
        name="newPassword"
        label="New Password"
        placeholder="Please enter new password (at least 8 characters)"
        rules={[
          { required: true, message: 'Please enter new password' },
          { min: 8, message: 'Password must be at least 8 characters' },
        ]}
      />
      <ProFormText.Password
        name="confirmPassword"
        label="Confirm New Password"
        placeholder="Please enter new password again"
        rules={[
          { required: true, message: 'Please confirm new password' },
          ({ getFieldValue }) => ({
            validator(_, value: unknown) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('The two passwords do not match'))
            },
          }),
        ]}
      />
    </ModalForm>
  )
}
