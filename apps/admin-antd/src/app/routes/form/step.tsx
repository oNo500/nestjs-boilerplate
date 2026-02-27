import {
  PageContainer,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  StepsForm,
} from '@ant-design/pro-components'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Result,
  Statistic,
} from 'antd'
import { useRef, useState } from 'react'

import type { FormInstance } from 'antd'
import type React from 'react'

interface StepData {
  payAccount: string
  receiverAccount: string
  receiverName: string
  amount: string
  receiverMode: string
}

const resultStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  padding: '24px 0 8px',
}

function StepDescriptions({
  stepData,
  bordered,
}: {
  stepData: StepData
  bordered?: boolean
}) {
  const { payAccount, receiverAccount, receiverName, amount } = stepData
  return (
    <Descriptions column={1} bordered={bordered}>
      <Descriptions.Item label="Payer Account">{payAccount}</Descriptions.Item>
      <Descriptions.Item label="Receiver Account">{receiverAccount}</Descriptions.Item>
      <Descriptions.Item label="Receiver Name">{receiverName}</Descriptions.Item>
      <Descriptions.Item label="Transfer Amount">
        <Statistic
          value={amount}
          suffix={<span style={{ fontSize: 14 }}>USD</span>}
          precision={2}
        />
      </Descriptions.Item>
    </Descriptions>
  )
}

function StepResult({
  onFinish,
  children,
}: {
  onFinish: () => Promise<void>
  children?: React.ReactNode
}) {
  return (
    <Result
      status="success"
      title="Transfer Successful"
      subTitle="Expected to arrive within two hours"
      extra={(
        <>
          <Button type="primary" onClick={onFinish}>
            New Transfer
          </Button>
          <Button>View Transactions</Button>
        </>
      )}
      style={resultStyle}
    >
      {children}
    </Result>
  )
}

export function FormStepPage() {
  const [stepData, setStepData] = useState<StepData>({
    payAccount: 'ant-design@alipay.com',
    receiverAccount: 'test@example.com',
    receiverName: 'Alex',
    amount: '500',
    receiverMode: 'alipay',
  })
  const [current, setCurrent] = useState(0)
  const formRef = useRef<FormInstance>(null)

  return (
    <PageContainer
      header={{ title: 'Step Form', breadcrumb: {} }}
      content="Break a lengthy or unfamiliar form task into multiple steps to guide the user through completion."
    >
      <Card variant="borderless">
        <StepsForm
          current={current}
          onCurrentChange={setCurrent}
          submitter={{
            render: (props, dom) => {
              if (props.step === 2) {
                return null
              }
              return dom as React.ReactNode
            },
          }}
        >
          <StepsForm.StepForm<StepData>
            formRef={formRef}
            title="Transfer Details"
            initialValues={stepData}
            onFinish={(values) => {
              setStepData(values)
              return Promise.resolve(true)
            }}
          >
            <ProFormSelect
              label="Payer Account"
              width="md"
              name="payAccount"
              rules={[{ required: true, message: 'Please select a payer account' }]}
              valueEnum={{
                'ant-design@alipay.com': 'ant-design@alipay.com',
              }}
            />
            <ProForm.Group title="Receiver Account" size={8}>
              <ProFormSelect
                name="receiverMode"
                rules={[{ required: true, message: 'Please select a payment method' }]}
                valueEnum={{
                  alipay: 'Alipay',
                  bank: 'Bank Account',
                }}
              />
              <ProFormText
                name="receiverAccount"
                rules={[
                  { required: true, message: 'Please enter the receiver account' },
                  { type: 'email', message: 'Account must be a valid email address' },
                ]}
                placeholder="test@example.com"
              />
            </ProForm.Group>
            <ProFormText
              label="Receiver Name"
              width="md"
              name="receiverName"
              rules={[{ required: true, message: 'Please enter the receiver name' }]}
              placeholder="Enter receiver name"
            />
            <ProFormDigit
              label="Transfer Amount"
              name="amount"
              width="md"
              rules={[
                { required: true, message: 'Please enter the transfer amount' },
                { pattern: /^(\d+)((?:\.\d+)?)$/, message: 'Please enter a valid amount' },
              ]}
              placeholder="Enter amount"
              fieldProps={{ prefix: '$' }}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm title="Confirm Transfer">
            <div style={resultStyle}>
              <Alert
                closable
                showIcon
                title="Once confirmed, funds will be transferred directly to the recipient and cannot be reversed."
                style={{ marginBottom: 24 }}
              />
              <StepDescriptions stepData={stepData} bordered />
              <Divider style={{ margin: '24px 0' }} />
              <ProFormText.Password
                label="Payment Password"
                width="md"
                name="password"
                required={false}
                rules={[{ required: true, message: 'Payment password is required to proceed' }]}
              />
            </div>
          </StepsForm.StepForm>

          <StepsForm.StepForm title="Done">
            <StepResult
              onFinish={() => {
                setCurrent(0)
                formRef.current?.resetFields()
                return Promise.resolve()
              }}
            >
              <StepDescriptions stepData={stepData} />
            </StepResult>
          </StepsForm.StepForm>
        </StepsForm>

        <Divider style={{ margin: '40px 0 24px' }} />
        <div>
          <h3>Notes</h3>
          <h4>Transfer to Alipay Account</h4>
          <p>
            If needed, you can place some frequently asked questions about the product here. If needed, you can place some frequently asked questions about the product here. If needed, you can place some frequently asked questions about the product here.
          </p>
          <h4>Transfer to Bank Card</h4>
          <p>
            If needed, you can place some frequently asked questions about the product here. If needed, you can place some frequently asked questions about the product here. If needed, you can place some frequently asked questions about the product here.
          </p>
        </div>
      </Card>
    </PageContainer>
  )
}
