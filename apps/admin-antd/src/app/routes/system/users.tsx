import { Space, Typography } from 'antd'

import { UsersTable } from '@/features/users'

const { Title } = Typography

export function UsersPage() {
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Users</Title>
      <UsersTable />
    </Space>
  )
}
