import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Badge, Card, Descriptions } from 'antd'

import type { ProColumnType } from '@ant-design/pro-components'

interface GoodItem {
  key: string
  name: string
  barcode: string
  price: string
  quantity: number
  amount: string
}

interface ReturnProgressItem {
  key: string
  time: string
  rate: string
  status: string
  operator: string
  remarks: string
}

const goodsData: GoodItem[] = [
  { key: '1', name: 'Mineral Water 550ml', barcode: '12421432143214321', price: '2.00', quantity: 1, amount: '2.00' },
  { key: '2', name: 'Herbal Tea', barcode: '8468235765132', price: '3.00', quantity: 2, amount: '6.00' },
  { key: '3', name: 'Tasty Chips', barcode: '1030810010122', price: '7.00', quantity: 2, amount: '14.00' },
  { key: '4', name: 'Delicious Cake', barcode: '43523423423', price: '8.00', quantity: 3, amount: '24.00' },
  { key: 'total', name: '', barcode: '', price: '', quantity: 8, amount: '46.00' },
]

const progressData: ReturnProgressItem[] = [
  { key: '1', time: '2017-10-01 14:10', rate: 'Contact Customer', status: 'In Progress', operator: 'Courier ID1234', remarks: 'Remark' },
  { key: '2', time: '2017-10-01 14:05', rate: 'Courier Departed', status: 'Success', operator: 'Courier ID1234', remarks: 'Remark' },
  { key: '3', time: '2017-10-01 13:05', rate: 'Courier Accepted Order', status: 'Success', operator: 'System', remarks: 'Remark' },
  { key: '4', time: '2017-10-01 13:00', rate: 'Application Approved', status: 'Success', operator: 'MatthewChang', remarks: 'Remark' },
]

const goodsColumns: ProColumnType<GoodItem>[] = [
  { title: 'Product Name', dataIndex: 'name', key: 'name' },
  { title: 'Barcode', dataIndex: 'barcode', key: 'barcode' },
  { title: 'Unit Price', dataIndex: 'price', key: 'price' },
  { title: 'Quantity (pcs)', dataIndex: 'quantity', key: 'quantity' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
]

const progressColumns: ProColumnType<ReturnProgressItem>[] = [
  { title: 'Time', dataIndex: 'time', key: 'time' },
  { title: 'Current Progress', dataIndex: 'rate', key: 'rate' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (_val, entity) =>
      entity.status === 'In Progress'
        ? (
            <Badge status="processing" text={entity.status} />
          )
        : (
            <Badge status="success" text={entity.status} />
          ),
  },
  { title: 'Operator ID', dataIndex: 'operator', key: 'operator' },
  { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
]

export function ProfileBasicPage() {
  return (
    <PageContainer header={{ title: 'Basic Profile', breadcrumb: {} }}>
      <Card variant="borderless" style={{ marginBottom: 24 }}>
        <Descriptions title="Refund Application" bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Pickup Order No.">1000000000</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge status="processing" text="In Progress" />
          </Descriptions.Item>
          <Descriptions.Item label="Sales Order No.">1234123421</Descriptions.Item>
          <Descriptions.Item label="Sub-order">3214321432</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card variant="borderless" style={{ marginBottom: 24 }}>
        <Descriptions title="User Information" bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Name">Fu Xiaoxiao</Descriptions.Item>
          <Descriptions.Item label="Phone">18100000000</Descriptions.Item>
          <Descriptions.Item label="Preferred Courier">Cainiao Warehouse</Descriptions.Item>
          <Descriptions.Item label="Pickup Address">Intersection of Huanggushan Rd and Maoyan St, Xihu District, Hangzhou, Zhejiang</Descriptions.Item>
          <Descriptions.Item label="Remarks">None</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card variant="borderless" title="Return Items" style={{ marginBottom: 24 }}>
        <ProTable<GoodItem>
          rowKey="key"
          columns={goodsColumns}
          dataSource={goodsData}
          search={false}
          pagination={false}
          toolBarRender={false}
        />
      </Card>

      <Card variant="borderless" title="Return Progress">
        <ProTable<ReturnProgressItem>
          rowKey="key"
          columns={progressColumns}
          dataSource={progressData}
          search={false}
          pagination={false}
          toolBarRender={false}
        />
      </Card>
    </PageContainer>
  )
}
