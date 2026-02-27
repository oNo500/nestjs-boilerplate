import { PageContainer } from '@ant-design/pro-components'

import { ScaffoldFullForm } from '@/features/scaffold'

export function ScaffoldFormPage() {
  return (
    <PageContainer
      header={{ title: 'Basic Form', breadcrumb: {} }}
      content="Form pages are used to collect or validate information from users. Basic forms are common in scenarios with fewer data fields."
    >
      <ScaffoldFullForm />
    </PageContainer>
  )
}
