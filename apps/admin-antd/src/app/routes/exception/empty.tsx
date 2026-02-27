import { PageContainer } from '@ant-design/pro-components'
import { Empty } from 'antd'
import { useTranslation } from 'react-i18next'

export function ErrorEmptyPage() {
  const { t } = useTranslation('common')
  return (
    <PageContainer header={{ title: t('error.emptyTitle'), breadcrumb: {} }}>
      <Empty description={t('error.emptyDesc')} />
    </PageContainer>
  )
}
