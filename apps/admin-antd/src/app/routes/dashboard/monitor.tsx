import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Col, Row, Statistic, Table, Tag, theme, Typography } from 'antd'
import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Legend,
} from 'recharts'

import { useMonitor } from '@/features/dashboard/api/use-dashboard'

export function DashboardMonitorPage() {
  const { token } = theme.useToken()
  const { data: monitor } = useMonitor()

  const monitorTxTrend = monitor?.txTrend ?? []
  const monitorCategoryRatio = monitor?.categoryRatio ?? []
  const monitorHotSearch = monitor?.hotSearch ?? []

  const hotSearchColumns = [
    {
      title: 'Rank',
      dataIndex: 'index',
      key: 'index',
      render: (val: number) => (
        <Tag color={val <= 3 ? 'red' : 'default'}>{val}</Tag>
      ),
    },
    { title: 'Search Keyword', dataIndex: 'keyword', key: 'keyword' },
    { title: 'Users', dataIndex: 'count', key: 'count' },
    {
      title: 'Weekly Growth',
      dataIndex: 'range',
      key: 'range',
      render: (val: number, record: { trend: 'up' | 'down' }) => (
        <span style={{ color: record.trend === 'up' ? token.colorSuccess : token.colorError }}>
          {val}
          %
          {record.trend === 'up'
            ? <TrendingUp size={12} style={{ marginLeft: 4 }} />
            : <TrendingDown size={12} style={{ marginLeft: 4 }} />}
        </span>
      ),
    },
  ]

  return (
    <PageContainer header={{ title: 'Monitor', breadcrumb: {} }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <ProCard bordered>
            <Statistic title="Today's Total Transactions" value={124_543_233} suffix="CNY" styles={{ content: { color: token.colorPrimary } }} />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard bordered>
            <Statistic title="Sales Target Completion" value={92} suffix="%" styles={{ content: { color: token.colorSuccess } }} />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard bordered>
            <Statistic title="Transactions Per Second" value={234} suffix="CNY" />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard bordered>
            <Statistic title="Event Time Remaining" value="48:00:27" />
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <ProCard title="Real-time Transaction Activity" bordered>
            <AreaChart
              responsive
              style={{ width: '100%', height: 240 }}
              data={monitorTxTrend}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="monitor-tx-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={token.colorPrimary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={token.colorPrimary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorderSecondary} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: token.colorTextSecondary }} interval={3} />
              <YAxis tick={{ fontSize: 12, fill: token.colorTextSecondary }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: token.colorBgElevated,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Transaction Amount (CNY)"
                stroke={token.colorPrimary}
                fill="url(#monitor-tx-gradient)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ProCard>
        </Col>
        <Col span={8}>
          <ProCard title="Category Breakdown" bordered style={{ height: '100%' }}>
            <PieChart responsive style={{ width: '100%', height: 240 }}>
              <Pie
                data={monitorCategoryRatio}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                isAnimationActive={false}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: 12, color: token.colorText }}>{value}</span>
                )}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: token.colorBgElevated,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard title="Hot Searches" bordered>
            <Row gutter={32}>
              <Col span={12}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>Search Users</Typography.Text>
                <Table
                  rowKey="index"
                  dataSource={monitorHotSearch}
                  columns={hotSearchColumns}
                  pagination={false}
                  size="small"
                  style={{ marginTop: 8 }}
                  showHeader={false}
                />
              </Col>
              <Col span={12}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>Weekly Growth</Typography.Text>
                <Table
                  rowKey="index"
                  dataSource={monitorHotSearch}
                  columns={hotSearchColumns}
                  pagination={false}
                  size="small"
                  style={{ marginTop: 8 }}
                  showHeader={false}
                />
              </Col>
            </Row>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
