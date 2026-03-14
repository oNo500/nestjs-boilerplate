import { Space, Typography } from 'antd'

import { LoginLogsTable } from '@/features/login-logs'

const { Title } = Typography

export function LoginLogsPage() {
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Login Logs</Title>
      <LoginLogsTable />
    </Space>
  )
}
