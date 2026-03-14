import { PageContainer } from '@ant-design/pro-components'
import { Empty } from 'antd'

export function ErrorEmptyPage() {
  return (
    <PageContainer header={{ title: 'Empty State', breadcrumb: {} }}>
      <Empty description="No data" />
    </PageContainer>
  )
}
