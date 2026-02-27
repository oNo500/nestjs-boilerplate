import { ProCard } from '@ant-design/pro-components'
import { Col, Progress, Row, Space, Statistic, theme, Typography } from 'antd'
import { AreaChart, Area, BarChart, Bar } from 'recharts'

const MOCK_SALES_TREND = [
  { v: 7 }, { v: 5 }, { v: 4 }, { v: 2 }, { v: 4 }, { v: 7 }, { v: 5 },
  { v: 6 }, { v: 8 }, { v: 6 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: 6 },
]
const MOCK_VISITS_TREND = [
  { v: 2 }, { v: 3 }, { v: 6 }, { v: 5 }, { v: 8 }, { v: 3 }, { v: 2 },
  { v: 5 }, { v: 4 }, { v: 7 }, { v: 3 }, { v: 5 }, { v: 2 }, { v: 4 },
]
const MOCK_PAY_TREND = [
  { v: 3 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: 5 }, { v: 7 }, { v: 4 },
  { v: 6 }, { v: 3 }, { v: 5 }, { v: 6 }, { v: 4 }, { v: 7 }, { v: 5 },
]

function TrendTag({ label, value, direction }: { label: string, value: number, direction: 'up' | 'down' }) {
  const { token } = theme.useToken()
  const color = direction === 'up' ? token.colorError : token.colorSuccess
  const arrow = direction === 'up' ? '▲' : '▼'
  return (
    <span style={{ fontSize: 12, color: token.colorTextSecondary, marginRight: 8 }}>
      {label}
      <span style={{ color, marginLeft: 4 }}>
        {value}
        %
        {arrow}
      </span>
    </span>
  )
}

export function StatisticsCards() {
  const { token } = theme.useToken()

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <ProCard title="Total Sales" bordered style={{ flex: 1 }}>
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            <Statistic value={126_560} prefix="¥" styles={{ content: { fontSize: 24 } }} />
            <div>
              <TrendTag label="WoW" value={12} direction="up" />
              <TrendTag label="DoD" value={11} direction="up" />
            </div>
            <AreaChart responsive style={{ width: '100%', height: 46 }} data={MOCK_SALES_TREND} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
              <defs>
                <linearGradient id="sales-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={token.colorPrimary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={token.colorPrimary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={token.colorPrimary} fill="url(#sales-grad)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </AreaChart>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Daily Sales
              {' '}
              <span style={{ color: token.colorText }}>¥12,423</span>
            </Typography.Text>
          </Space>
        </ProCard>
      </Col>

      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <ProCard title="Visits" bordered style={{ flex: 1 }}>
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            <Statistic value={8846} styles={{ content: { fontSize: 24 } }} />
            <AreaChart responsive style={{ width: '100%', height: 46 }} data={MOCK_VISITS_TREND} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
              <defs>
                <linearGradient id="visits-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={token.colorPrimary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={token.colorPrimary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={token.colorPrimary} fill="url(#visits-grad)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </AreaChart>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Daily Visits
              {' '}
              <span style={{ color: token.colorText }}>1,234</span>
            </Typography.Text>
          </Space>
        </ProCard>
      </Col>

      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <ProCard title="Payment Count" bordered style={{ flex: 1 }}>
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            <Statistic value={6560} styles={{ content: { fontSize: 24 } }} />
            <BarChart responsive style={{ width: '100%', height: 46 }} data={MOCK_PAY_TREND} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
              <Bar dataKey="v" fill={token.colorPrimary} isAnimationActive={false} radius={[1, 1, 0, 0]} />
            </BarChart>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Conversion Rate
              {' '}
              <span style={{ color: token.colorText }}>60%</span>
            </Typography.Text>
          </Space>
        </ProCard>
      </Col>

      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <ProCard title="Campaign Performance" bordered style={{ flex: 1 }}>
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            <Statistic value="78%" styles={{ content: { fontSize: 24 } }} />
            <Progress percent={78} strokeColor={token.colorPrimary} />
            <div>
              <TrendTag label="WoW" value={12} direction="up" />
              <TrendTag label="DoD" value={11} direction="down" />
            </div>
          </Space>
        </ProCard>
      </Col>
    </Row>
  )
}
