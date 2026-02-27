import { PageContainer } from '@ant-design/pro-components'

import { ScaffoldListTable } from '@/features/scaffold'

export function ScaffoldListPage() {
  return (
    <PageContainer header={{ title: 'List Page Template', breadcrumb: {} }}>
      <ScaffoldListTable />
    </PageContainer>
  )
}
