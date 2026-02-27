import { PageContainer } from '@ant-design/pro-components'
import { Button, Card, Descriptions, Result, Steps, theme } from 'antd'

export function ResultSuccessPage() {
  const { token } = theme.useToken()

  const desc1 = (
    <Descriptions column={1} size="small">
      <Descriptions.Item label="Project ID">2000000001</Descriptions.Item>
      <Descriptions.Item label="Owner">Alice</Descriptions.Item>
      <Descriptions.Item label="Effective Period">2016-12-12 ~ 2017-12-12</Descriptions.Item>
    </Descriptions>
  )

  const desc2 = (
    <Descriptions column={1} size="small">
      <Descriptions.Item label="Project ID">2000000002</Descriptions.Item>
      <Descriptions.Item label="Owner">Bob</Descriptions.Item>
      <Descriptions.Item label="Effective Period">2016-12-12 ~ 2017-12-12</Descriptions.Item>
    </Descriptions>
  )

  return (
    <PageContainer header={{ title: 'Success', breadcrumb: {} }}>
      <Card variant="borderless">
        <Result
          status="success"
          title="Submitted Successfully"
          subTitle="The result page is used to provide feedback on the outcome of a series of operations. For simple actions, use a Message notification instead. This text area can display brief supplementary notes. If you need to show something like a receipt, the gray area below can present more complex content."
          extra={(
            <>
              <Button type="primary">Back to List</Button>
              <Button>View Project</Button>
              <Button>Print</Button>
            </>
          )}
        >
          <div style={{ background: token.colorFillAlter, padding: 24, marginBottom: 24 }}>
            <Descriptions title="Project Name" column={2}>
              <Descriptions.Item label="Organization">
                <a href="#">Super Admin</a>
              </Descriptions.Item>
              <Descriptions.Item label="Created By">Bob</Descriptions.Item>
              <Descriptions.Item label="Product">XX Service</Descriptions.Item>
              <Descriptions.Item label="Order ID">2000000001</Descriptions.Item>
              <Descriptions.Item label="Billing Account">ant-design@alipay.com</Descriptions.Item>
              <Descriptions.Item label="Invoice">Issued</Descriptions.Item>
              <Descriptions.Item label="Notes">Please confirm within two business days</Descriptions.Item>
            </Descriptions>
          </div>
          <Steps
            type="dot"
            current={1}
            items={[
              { title: 'Create Project', description: desc1 },
              { title: 'Owner Confirmation', description: desc2 },
              { title: 'Finance Review' },
              { title: 'Complete' },
            ]}
          />
        </Result>
      </Card>
    </PageContainer>
  )
}
