import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Button, Card, Descriptions, Empty, Space, Statistic, Steps, Table } from 'antd'
import { useState } from 'react'

import type { ProColumnType } from '@ant-design/pro-components'
import type { ColumnType } from 'antd/es/table'

interface OperationLog {
  key: string
  time: string
  type: string
  operator: string
  content: string
}

interface StepInfo {
  title: string
  description: string
  subTitle?: string
}

const orderInfo = {
  id: 'ORD-20170116-00001',
  date: '2017-01-16',
  payTime: '2017-01-16 12:30',
  recipient: 'Fu Xiaoxiao',
  amount: '3,280.00',
  phone: '180 0000 0000',
  address: 'Jiangcun Street, Xihu District, Hangzhou, Zhejiang',
  note: 'Please confirm within two business days',
}

const steps: StepInfo[] = [
  { title: 'Buyer Placed Order', description: '2016-12-12 12:32' },
  { title: 'Seller Processing', description: '2016-12-12 11:32', subTitle: 'Took 2 hours' },
  { title: 'Buyer Paid', description: '2016-12-12 10:32' },
  { title: 'Seller Shipped', description: '2016-12-12 09:32' },
  { title: 'In Transit', description: '2016-12-12 08:32' },
  { title: 'Transaction Complete', description: '2016-12-12 07:32' },
]

const orderLogData: OperationLog[] = [
  { key: '1', time: '2017-10-01 14:10', type: 'Operation Type 1', operator: 'admin', content: 'Operation Content' },
  { key: '2', time: '2017-10-01 13:10', type: 'Operation Type 2', operator: 'admin', content: 'Operation Content' },
  { key: '3', time: '2017-10-01 12:10', type: 'Operation Type 3', operator: 'admin', content: 'Operation Content' },
  { key: '4', time: '2017-10-01 11:10', type: 'Operation Type 4', operator: 'admin', content: 'Operation Content' },
]

const ruleLogData: OperationLog[] = [
  { key: '1', time: '2017-09-20 10:00', type: 'Rule Triggered', operator: 'system', content: 'Rule Content 1' },
  { key: '2', time: '2017-09-19 10:00', type: 'Rule Updated', operator: 'admin', content: 'Rule Content 2' },
]

const logColumns: ColumnType<OperationLog>[] = [
  { title: 'Time', dataIndex: 'time', key: 'time' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Operator', dataIndex: 'operator', key: 'operator' },
  { title: 'Result', dataIndex: 'content', key: 'content' },
]

const proLogColumns: ProColumnType<OperationLog>[] = [
  { title: 'Time', dataIndex: 'time', key: 'time' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Operator', dataIndex: 'operator', key: 'operator' },
  { title: 'Result', dataIndex: 'content', key: 'content' },
]

export function ProfileAdvancedPage() {
  const [activeTab, setActiveTab] = useState('detail')
  const [logTab, setLogTab] = useState('order')

  return (
    <PageContainer
      header={{
        title: `Order No.: ${orderInfo.id}`,
        breadcrumb: {},
        extra: (
          <Space>
            <Space.Compact>
              <Button>Action 1</Button>
              <Button>Action 2</Button>
            </Space.Compact>
            <Button type="primary">Primary Action</Button>
          </Space>
        ),
      }}
      content={(
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Created By">Fu Xiaoxiao</Descriptions.Item>
          <Descriptions.Item label="Product">XX Service</Descriptions.Item>
          <Descriptions.Item label="Created At">{orderInfo.date}</Descriptions.Item>
          <Descriptions.Item label="Related Order">12421</Descriptions.Item>
          <Descriptions.Item label="Effective Date">2016-12-12 ~ 2017-12-12</Descriptions.Item>
          <Descriptions.Item label="Remarks">{orderInfo.note}</Descriptions.Item>
        </Descriptions>
      )}
      extraContent={(
        <Space size="large">
          <Statistic title="Status" value="Pending Approval" />
          <Statistic title="Order Amount" prefix="$" value={orderInfo.amount} />
        </Space>
      )}
      tabList={[
        { key: 'detail', tab: 'Details' },
        { key: 'rule', tab: 'Rules' },
      ]}
      onTabChange={setActiveTab}
    >
      {activeTab === 'detail' && (
        <>
          <Card title="Process Progress" variant="borderless" style={{ marginBottom: 24 }}>
            <Steps
              type="dot"
              current={1}
              items={steps.map((s) => ({
                title: s.title,
                description: s.description,
                subTitle: s.subTitle,
              }))}
            />
          </Card>

          <Card title="User Information" variant="borderless" style={{ marginBottom: 24 }}>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Name">{orderInfo.recipient}</Descriptions.Item>
              <Descriptions.Item label="Phone">{orderInfo.phone}</Descriptions.Item>
              <Descriptions.Item label="Shipping Address">{orderInfo.address}</Descriptions.Item>
              <Descriptions.Item label="Remarks">{orderInfo.note}</Descriptions.Item>
            </Descriptions>
            <Descriptions title="Info Group" style={{ marginTop: 24 }}>
              <Descriptions.Item label="Data Field">725</Descriptions.Item>
              <Descriptions.Item label="Data Field">725</Descriptions.Item>
              <Descriptions.Item label="Data Field">725</Descriptions.Item>
              <Descriptions.Item label="Data Field">725</Descriptions.Item>
              <Descriptions.Item label="Data Field">725</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Last 6 Months Record" variant="borderless" style={{ marginBottom: 24 }}>
            <Empty />
          </Card>

          <Card
            variant="borderless"
            tabList={[
              { key: 'order', tab: 'Operation Log 1' },
              { key: 'rule', tab: 'Operation Log 2' },
            ]}
            onTabChange={setLogTab}
          >
            <Table<OperationLog>
              rowKey="key"
              columns={logColumns}
              dataSource={logTab === 'order' ? orderLogData : ruleLogData}
              pagination={false}
            />
          </Card>
        </>
      )}

      {activeTab === 'rule' && (
        <Card variant="borderless">
          <ProTable<OperationLog>
            rowKey="key"
            columns={proLogColumns}
            dataSource={ruleLogData}
            search={false}
            pagination={false}
            toolBarRender={false}
          />
        </Card>
      )}
    </PageContainer>
  )
}
