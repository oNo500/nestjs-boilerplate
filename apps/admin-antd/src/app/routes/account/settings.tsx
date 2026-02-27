import {
  PageContainer,
  ProForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'
import { Button, Card, Divider, List, Menu, Switch, theme, Typography } from 'antd'
import { useState } from 'react'

import type { MenuProps } from 'antd'

const { Text, Title } = Typography

type SettingsKey = 'base' | 'security' | 'binding' | 'notification'

const menuItems: MenuProps['items'] = [
  { key: 'base', label: 'Basic Settings' },
  { key: 'security', label: 'Security Settings' },
  { key: 'binding', label: 'Account Binding' },
  { key: 'notification', label: 'Notification Settings' },
]

const provinceOptions = [
  { label: 'Zhejiang', value: 'zhejiang' },
  { label: 'Jiangsu', value: 'jiangsu' },
]

const cityMap: Record<string, { label: string, value: string }[]> = {
  zhejiang: [
    { label: 'Hangzhou', value: 'hangzhou' },
    { label: 'Ningbo', value: 'ningbo' },
  ],
  jiangsu: [
    { label: 'Nanjing', value: 'nanjing' },
    { label: 'Suzhou', value: 'suzhou' },
  ],
}

interface SecurityItem {
  key: string
  title: string
  description: string
  actions: string[]
  level?: string
}

const securityList: SecurityItem[] = [
  {
    key: 'password',
    title: 'Account Password',
    description: 'Current password strength: ',
    level: 'Strong',
    actions: ['Modify'],
  },
  {
    key: 'phone',
    title: 'Security Phone',
    description: 'Bound phone: 138****8293',
    actions: ['Modify'],
  },
  {
    key: 'question',
    title: 'Security Question',
    description: 'No security question set. A security question can effectively protect your account.',
    actions: ['Set'],
  },
  {
    key: 'email',
    title: 'Backup Email',
    description: 'Bound email: ant***sign.com',
    actions: ['Modify'],
  },
  {
    key: 'mfa',
    title: 'MFA Device',
    description: 'No MFA device bound. After binding, two-factor confirmation will be enabled.',
    actions: ['Bind'],
  },
]

interface BindingItem {
  key: string
  title: string
  description: string
  icon: string
  bound: boolean
}

const bindingList: BindingItem[] = [
  { key: 'taobao', title: 'Bind Taobao', description: 'No Taobao account bound', icon: 'T', bound: false },
  { key: 'alipay', title: 'Bind Alipay', description: 'No Alipay account bound', icon: 'A', bound: false },
  { key: 'dingtalk', title: 'Bind DingTalk', description: 'No DingTalk account bound', icon: 'D', bound: false },
]

interface NotificationItem {
  key: string
  title: string
  description: string
  defaultChecked: boolean
}

const notificationList: NotificationItem[] = [
  { key: 'message', title: 'Account Messages', description: 'Messages from other users will be sent as in-app notifications', defaultChecked: true },
  { key: 'system', title: 'System Messages', description: 'System messages will be sent as in-app notifications', defaultChecked: true },
  { key: 'todo', title: 'To-do Tasks', description: 'To-do tasks will be sent as in-app notifications', defaultChecked: false },
]

function BaseView() {
  const { token } = theme.useToken()
  return (
    <div style={{ display: 'flex', gap: 40 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ProForm
          layout="vertical"
          submitter={{ searchConfig: { submitText: 'Update Basic Info' }, resetButtonProps: { style: { display: 'none' } } }}
          onFinish={() => Promise.resolve(true)}
          initialValues={{
            email: 'antdesign@alipay.com',
            nickname: 'Serati Ma',
            profile: 'Ant Financial, Hangzhou, Xihu District',
            country: 'China',
            province: 'zhejiang',
            city: 'hangzhou',
            address: '77 Gongzhuan Rd, Xihu District',
            phone: '0752-268888888',
          }}
        >
          <ProFormText name="email" label="Email" disabled />
          <ProFormText name="nickname" label="Nickname" rules={[{ required: true, message: 'Please enter a nickname' }]} />
          <ProFormTextArea name="profile" label="Bio" placeholder="Bio" />
          <ProFormSelect
            name="country"
            label="Country / Region"
            options={[{ label: 'China', value: 'China' }]}
          />
          <ProFormSelect name="province" label="Province" options={provinceOptions} />
          <ProFormDependency name={['province']}>
            {({ province }) => {
              const provinceKey = province as string
              return (
                <ProFormSelect
                  name="city"
                  label="City"
                  options={cityMap[provinceKey] ?? []}
                  disabled={!province}
                />
              )
            }}
          </ProFormDependency>
          <ProFormText name="address" label="Street Address" />
          <ProFormText name="phone" label="Phone" />
        </ProForm>
      </div>
      <div style={{ width: 144, flexShrink: 0, textAlign: 'center' }}>
        <div
          style={{
            width: 144,
            height: 144,
            borderRadius: '50%',
            background: token.colorFillSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            color: token.colorTextSecondary,
            marginBottom: 12,
          }}
        >
          U
        </div>
        <Button>Change Avatar</Button>
      </div>
    </div>
  )
}

function SecurityView() {
  return (
    <List<SecurityItem>
      itemLayout="horizontal"
      dataSource={securityList}
      renderItem={(item) => (
        <List.Item actions={item.actions.map((action) => <a key={action}>{action}</a>)}>
          <List.Item.Meta
            title={item.title}
            description={(
              <Text type="secondary">
                {item.description}
                {item.level && <Text type="danger">{item.level}</Text>}
              </Text>
            )}
          />
        </List.Item>
      )}
    />
  )
}

function BindingView() {
  const { token } = theme.useToken()
  return (
    <List<BindingItem>
      itemLayout="horizontal"
      dataSource={bindingList}
      renderItem={(item) => (
        <List.Item actions={[<a key="bind">{item.bound ? 'Unbind' : 'Bind'}</a>]}>
          <List.Item.Meta
            avatar={(
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: token.colorPrimary,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {item.icon}
              </div>
            )}
            title={item.title}
            description={item.description}
          />
        </List.Item>
      )}
    />
  )
}

function NotificationView() {
  return (
    <>
      <Title level={5}>In-App Messages</Title>
      <List<NotificationItem>
        itemLayout="horizontal"
        dataSource={notificationList}
        renderItem={(item) => (
          <List.Item actions={[<Switch key="switch" defaultChecked={item.defaultChecked} />]}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
      <Divider />
      <Title level={5}>Push Notifications</Title>
      <List
        itemLayout="horizontal"
        dataSource={[
          { key: 'push-message', title: 'Account Messages', description: 'Receive account messages in real time', defaultChecked: false },
          { key: 'push-news', title: 'Industry News', description: 'Receive industry news pushed by the system', defaultChecked: true },
        ]}
        renderItem={(item: NotificationItem) => (
          <List.Item actions={[<Switch key="switch" defaultChecked={item.defaultChecked} />]}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </>
  )
}

function SettingsContent({ activeKey }: { activeKey: SettingsKey }) {
  if (activeKey === 'base') return <BaseView />
  if (activeKey === 'security') return <SecurityView />
  if (activeKey === 'binding') return <BindingView />
  return <NotificationView />
}

export function AccountSettingsPage() {
  const { token } = theme.useToken()
  const [selectedKey, setSelectedKey] = useState<SettingsKey>('base')

  return (
    <PageContainer header={{ title: 'Account Settings', breadcrumb: {} }}>
      <Card variant="borderless">
        <div style={{ display: 'flex', gap: 0 }}>
          <div style={{ width: 192, flexShrink: 0, borderRight: `1px solid ${token.colorSplit}` }}>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems}
              style={{ border: 'none' }}
              onClick={({ key }) => setSelectedKey(key as SettingsKey)}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, padding: '0 24px' }}>
            <SettingsContent activeKey={selectedKey} />
          </div>
        </div>
      </Card>
    </PageContainer>
  )
}
