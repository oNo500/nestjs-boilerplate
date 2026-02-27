import { PageContainer } from '@ant-design/pro-components'
import { Space } from 'antd'

import { StatisticsCards, UserGrowthChart, HourlyRegistrationChart } from '@/features/dashboard'

export function DashboardAnalysisPage() {
  return (
    <PageContainer header={{ title: 'Analysis', breadcrumb: {} }}>
      <Space orientation="vertical" size="middle" style={{ width: '100%', display: 'flex' }}>
        <StatisticsCards />
        <UserGrowthChart />
        <HourlyRegistrationChart />
      </Space>
    </PageContainer>
  )
}
