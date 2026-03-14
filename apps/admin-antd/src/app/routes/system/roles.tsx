import { Space, Typography } from 'antd'

import { RolesTable } from '@/features/roles'

const { Title } = Typography

export function RolesPage() {
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Roles</Title>
      <RolesTable />
    </Space>
  )
}
