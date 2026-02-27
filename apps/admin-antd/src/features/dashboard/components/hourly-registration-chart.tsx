import { ProCard } from '@ant-design/pro-components'
import { Col, Progress, Radio, Row, Statistic, Table, theme, Typography } from 'antd'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { PieChart, Pie, Tooltip } from 'recharts'

import { useAnalysis } from '@/features/dashboard/api/use-dashboard'

type ChannelKey = 'all' | 'online' | 'store'

export function HourlyRegistrationChart() {
  const { token } = theme.useToken()
  const [channel, setChannel] = useState<ChannelKey>('all')
  const { data: analysis } = useAnalysis()

  const analysisHotSearch = analysis?.hotSearch ?? []
  const analysisCategoryRatio = analysis?.categoryRatio ?? []
  const analysisStores = analysis?.stores ?? []

  const hotSearchColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 40,
      render: (val: number) => (
        <span
          style={{
            display: 'inline-block',
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: val <= 3 ? token.colorPrimary : token.colorFillSecondary,
            color: val <= 3 ? '#fff' : token.colorTextSecondary,
            textAlign: 'center',
            lineHeight: '20px',
            fontSize: 12,
          }}
        >
          {val}
        </span>
      ),
    },
    {
      title: 'Keyword',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (val: string) => <Typography.Link style={{ fontSize: 13 }}>{val}</Typography.Link>,
    },
    { title: 'Users', dataIndex: 'count', key: 'count' },
    {
      title: 'WoW Growth',
      dataIndex: 'range',
      key: 'range',
      render: (val: number, record: { trend: 'up' | 'down' }) => (
        <span style={{ color: record.trend === 'up' ? token.colorError : token.colorSuccess, fontSize: 13 }}>
          {val}
          %
          {record.trend === 'up'
            ? <TrendingUp size={10} style={{ marginLeft: 2, verticalAlign: 'middle' }} />
            : <TrendingDown size={10} style={{ marginLeft: 2, verticalAlign: 'middle' }} />}
        </span>
      ),
    },
  ]

  return (
    <Row gutter={16}>
      <Col span={12}>
        <ProCard title="Top Online Searches" bordered>
          <Row gutter={32} style={{ marginBottom: 16 }}>
            <Col>
              <Statistic
                title="Search Users"
                value={12_321}
                styles={{ content: { fontSize: 20 } }}
                suffix={<span style={{ fontSize: 12, color: token.colorSuccess, marginLeft: 4 }}>17.1%</span>}
              />
            </Col>
            <Col>
              <Statistic
                title="Avg Searches per User"
                value={2.7}
                precision={1}
                styles={{ content: { fontSize: 20 } }}
                suffix={<span style={{ fontSize: 12, color: token.colorSuccess, marginLeft: 4 }}>6.2%</span>}
              />
            </Col>
          </Row>
          <Table
            rowKey="rank"
            dataSource={analysisHotSearch}
            columns={hotSearchColumns}
            pagination={{ pageSize: 5, size: 'small' }}
            size="small"
            showHeader={false}
          />
        </ProCard>
      </Col>

      <Col span={12}>
        <ProCard
          title="Sales by Category"
          bordered
          extra={(
            <Radio.Group
              value={channel}
              onChange={(e) => setChannel(e.target.value as ChannelKey)}
              size="small"
            >
              <Radio.Button value="all">All Channels</Radio.Button>
              <Radio.Button value="online">Online</Radio.Button>
              <Radio.Button value="store">Store</Radio.Button>
            </Radio.Group>
          )}
        >
          <Row gutter={32}>
            <Col span={12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PieChart width={220} height={180}>
                <Pie
                  data={analysisCategoryRatio}
                  cx={110}
                  cy={90}
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  isAnimationActive={false}
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
              <Row gutter={[8, 4]} justify="center">
                {analysisCategoryRatio.map((item) => (
                  <Col key={item.name}>
                    <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
                      <span style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: item.fill,
                        marginRight: 4,
                      }}
                      />
                      {item.name}
                    </span>
                  </Col>
                ))}
              </Row>
            </Col>
            <Col span={12}>
              {analysisStores.map((store) => (
                <div key={store.name} style={{ marginBottom: 12 }}>
                  <Row justify="space-between" style={{ marginBottom: 4 }}>
                    <Typography.Text style={{ fontSize: 12 }}>{store.name}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Conversion Rate
                      {' '}
                      {store.conversionRate}
                      %
                    </Typography.Text>
                  </Row>
                  <Progress
                    percent={store.conversionRate}
                    showInfo={false}
                    strokeColor={token.colorPrimary}
                    size="small"
                  />
                </div>
              ))}
            </Col>
          </Row>
        </ProCard>
      </Col>
    </Row>
  )
}
