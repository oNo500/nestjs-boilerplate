import { PageContainer } from '@ant-design/pro-components'

import { AntdShowcase } from '@/features/foundation/components/antd-showcase'

export function FoundationComponentsPage() {
  return (
    <PageContainer header={{ title: 'Components', breadcrumb: {} }}>
      <AntdShowcase />
    </PageContainer>
  )
}
