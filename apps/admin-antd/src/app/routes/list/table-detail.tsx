import { PageContainer } from '@ant-design/pro-components'
import { useNavigate, useParams } from 'react-router'

import { ScaffoldDetailView } from '@/features/scaffold'

export function ScaffoldDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <PageContainer
      header={{
        title: 'Detail Page Template',
        onBack: () => { void navigate(-1) },
      }}
    >
      <ScaffoldDetailView id={id!} />
    </PageContainer>
  )
}
