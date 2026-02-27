import { Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import { UsersTable } from '@/features/users'

const { Title } = Typography

export function UsersPage() {
  const { t } = useTranslation('users')

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>{t('page.title')}</Title>
      <UsersTable />
    </Space>
  )
}
