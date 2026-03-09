import { Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import { LoginLogsTable } from '@/features/login-logs'

const { Title } = Typography

export function LoginLogsPage() {
  const { t } = useTranslation('login-logs')

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>{t('page.title')}</Title>
      <LoginLogsTable />
    </Space>
  )
}
