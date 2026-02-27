import { Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import { RolesTable } from '@/features/roles'

const { Title } = Typography

export function RolesPage() {
  const { t } = useTranslation('roles')

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>{t('page.title')}</Title>
      <RolesTable />
    </Space>
  )
}
