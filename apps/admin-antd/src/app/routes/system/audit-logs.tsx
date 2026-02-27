import { Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import { AuditLogsTable } from '@/features/audit-logs'

const { Title } = Typography

export function AuditLogsPage() {
  const { t } = useTranslation('audit-logs')

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>{t('page.title')}</Title>
      <AuditLogsTable />
    </Space>
  )
}
