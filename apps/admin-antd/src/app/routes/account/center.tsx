import { Space, Typography } from 'antd'

import { ProfileForm, ChangePasswordForm } from '@/features/profile'

const { Title } = Typography

export function ProfilePage() {
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={2}>Profile Center</Title>
        <ChangePasswordForm />
      </Space>
      <ProfileForm />
    </Space>
  )
}
