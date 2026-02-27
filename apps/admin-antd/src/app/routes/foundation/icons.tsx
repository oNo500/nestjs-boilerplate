import { PageContainer } from '@ant-design/pro-components'

import { IconShowcase } from '@/features/foundation/icons/icon-showcase'

export function FoundationIconsPage() {
  return (
    <PageContainer header={{ title: 'Icons', breadcrumb: {} }}>
      <IconShowcase />
    </PageContainer>
  )
}
