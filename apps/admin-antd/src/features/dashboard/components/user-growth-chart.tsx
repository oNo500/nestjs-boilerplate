import { ProCard } from '@ant-design/pro-components'
import { Col, List, Radio, Row, Tabs, theme, Typography } from 'antd'
import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

import { useAnalysis } from '@/features/dashboard/api/use-dashboard'

type RangeKey = 'today' | 'week' | 'month' | 'year'

export function UserGrowthChart() {
  const { token } = theme.useToken()
  const [activeTab, setActiveTab] = useState('sales')
  const [range, setRange] = useState<RangeKey>('today')
  const { data: analysis } = useAnalysis()

  const rangeData = {
    today: analysis?.salesTrend ?? [],
    week: analysis?.salesTrendWeek ?? [],
    month: analysis?.salesTrendMonth ?? [],
    year: analysis?.salesTrendMonth ?? [],
  }
  const data = rangeData[range]
  const analysisStoreRank = analysis?.storeRank ?? []

  const rangeExtra = (
    <Radio.Group
      value={range}
      onChange={(e) => setRange(e.target.value as RangeKey)}
      size="small"
    >
      <Radio.Button value="today">Today</Radio.Button>
      <Radio.Button value="week">This Week</Radio.Button>
      <Radio.Button value="month">This Month</Radio.Button>
      <Radio.Button value="year">This Year</Radio.Button>
    </Radio.Group>
  )

  return (
    <ProCard bordered>
      <Row gutter={16}>
        <Col span={18}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarExtraContent={rangeExtra}
            items={[
              { key: 'sales', label: 'Sales' },
              { key: 'visits', label: 'Visits' },
            ]}
          />
          <AreaChart
            responsive
            style={{ width: '100%', height: 240 }}
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="analysis-main-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={token.colorPrimary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={token.colorPrimary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorderSecondary} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: token.colorTextSecondary }} />
            <YAxis tick={{ fontSize: 12, fill: token.colorTextSecondary }} />
            <Tooltip
              contentStyle={{
                backgroundColor: token.colorBgElevated,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {activeTab === 'sales'
              ? (
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke={token.colorPrimary}
                    fill="url(#analysis-main-grad)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )
              : (
                  <Area
                    type="monotone"
                    dataKey="visits"
                    name="Visits"
                    stroke={token.colorSuccess}
                    fill="url(#analysis-main-grad)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
          </AreaChart>
        </Col>
        <Col span={6} style={{ borderLeft: `1px solid ${token.colorBorderSecondary}`, paddingLeft: 24 }}>
          <Typography.Text strong style={{ fontSize: 14 }}>Store Sales Ranking</Typography.Text>
          <List
            style={{ marginTop: 12 }}
            dataSource={analysisStoreRank}
            renderItem={(item) => (
              <List.Item style={{ padding: '8px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                <Row align="middle" style={{ width: '100%' }} gutter={8}>
                  <Col flex="none">
                    <span
                      style={{
                        display: 'inline-block',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: item.rank <= 3 ? token.colorPrimary : token.colorFillSecondary,
                        color: item.rank <= 3 ? '#fff' : token.colorTextSecondary,
                        textAlign: 'center',
                        lineHeight: '20px',
                        fontSize: 12,
                      }}
                    >
                      {item.rank}
                    </span>
                  </Col>
                  <Col flex="auto">
                    <Typography.Text style={{ fontSize: 13 }}>{item.name}</Typography.Text>
                  </Col>
                  <Col flex="none">
                    <Typography.Text style={{ fontSize: 13 }}>
                      {item.amount.toLocaleString()}
                    </Typography.Text>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </ProCard>
  )
}
