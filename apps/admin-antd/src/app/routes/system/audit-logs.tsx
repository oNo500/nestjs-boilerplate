import { Space, Typography } from 'antd'

import { AuditLogsTable } from '@/features/audit-logs'

const { Title } = Typography

export function AuditLogsPage() {
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Audit Logs</Title>
      <AuditLogsTable />
    </Space>
  )
}
