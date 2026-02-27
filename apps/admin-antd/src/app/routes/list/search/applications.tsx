import { PageContainer } from '@ant-design/pro-components'
import { Avatar, Badge, Card, Input, List, Select, Space, Tag, Typography } from 'antd'
import { AppWindow, Database, Globe, Lock, MessageSquare, Server } from 'lucide-react'

const { Text } = Typography

interface Application {
  id: string
  name: string
  description: string
  type: 'web' | 'api' | 'service' | 'database' | 'gateway' | 'mq'
  status: 'online' | 'offline' | 'warning'
  version: string
  instances: number
  updatedAt: string
}

const applications: Application[] = [
  {
    id: '1',
    name: 'Auth Center',
    description: 'Unified user authentication and authorization service with OAuth2.0 and JWT support.',
    type: 'api',
    status: 'online',
    version: 'v2.3.1',
    instances: 3,
    updatedAt: '2023-12-05',
  },
  {
    id: '2',
    name: 'Admin Portal',
    description: 'Internal enterprise management system with fine-grained control over users, roles, and permissions.',
    type: 'web',
    status: 'online',
    version: 'v1.8.0',
    instances: 2,
    updatedAt: '2023-12-01',
  },
  {
    id: '3',
    name: 'API Gateway',
    description: 'Unified entry point handling routing, load balancing, rate limiting, and circuit breaking.',
    type: 'gateway',
    status: 'online',
    version: 'v3.0.2',
    instances: 4,
    updatedAt: '2023-11-28',
  },
  {
    id: '4',
    name: 'Primary Database',
    description: 'PostgreSQL primary-replica cluster storing core business data.',
    type: 'database',
    status: 'online',
    version: '15.2',
    instances: 1,
    updatedAt: '2023-11-20',
  },
  {
    id: '5',
    name: 'Message Queue',
    description: 'RabbitMQ message broker for handling async tasks and event-driven communication.',
    type: 'mq',
    status: 'warning',
    version: '3.12.0',
    instances: 2,
    updatedAt: '2023-12-03',
  },
  {
    id: '6',
    name: 'File Storage Service',
    description: 'MinIO-based object storage service supporting upload and management of images, documents, and more.',
    type: 'service',
    status: 'online',
    version: 'v1.2.0',
    instances: 2,
    updatedAt: '2023-11-15',
  },
  {
    id: '7',
    name: 'Security Audit',
    description: 'Records all critical operation logs, supporting compliance auditing and anomaly detection.',
    type: 'service',
    status: 'offline',
    version: 'v0.9.5',
    instances: 0,
    updatedAt: '2023-10-30',
  },
]

const typeConfig: Record<
  Application['type'],
  { label: string, icon: React.ReactNode, color: string }
> = {
  web: { label: 'Web', icon: <Globe size={16} />, color: '#1677ff' },
  api: { label: 'API', icon: <Lock size={16} />, color: '#52c41a' },
  service: { label: 'Service', icon: <Server size={16} />, color: '#722ed1' },
  database: { label: 'Database', icon: <Database size={16} />, color: '#faad14' },
  gateway: { label: 'Gateway', icon: <AppWindow size={16} />, color: '#13c2c2' },
  mq: { label: 'Message Queue', icon: <MessageSquare size={16} />, color: '#eb2f96' },
}

const statusConfig: Record<Application['status'], { label: string, status: 'success' | 'error' | 'warning' }> = {
  online: { label: 'Running', status: 'success' },
  offline: { label: 'Offline', status: 'error' },
  warning: { label: 'Warning', status: 'warning' },
}

export function ListSearchApplicationsPage() {
  return (
    <PageContainer header={{ title: 'Search List (Applications)', breadcrumb: {} }}>
      <Card variant="borderless" style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Input.Search placeholder="Search application name" style={{ width: 300 }} />
          <Select
            placeholder="App type"
            style={{ width: 140 }}
            options={[
              { label: 'All', value: '' },
              { label: 'Web', value: 'web' },
              { label: 'API', value: 'api' },
              { label: 'Service', value: 'service' },
              { label: 'Database', value: 'database' },
              { label: 'Gateway', value: 'gateway' },
              { label: 'Message Queue', value: 'mq' },
            ]}
          />
          <Select
            placeholder="Status"
            style={{ width: 120 }}
            options={[
              { label: 'All', value: '' },
              { label: 'Running', value: 'online' },
              { label: 'Offline', value: 'offline' },
              { label: 'Warning', value: 'warning' },
            ]}
          />
        </Space>
      </Card>

      <Card variant="borderless">
        <List<Application>
          dataSource={applications}
          rowKey="id"
          renderItem={(item) => {
            const type = typeConfig[item.type]
            const statusInfo = statusConfig[item.status]
            return (
              <List.Item
                actions={[
                  <Badge key="status" status={statusInfo.status} text={statusInfo.label} />,
                  <a key="detail">Details</a>,
                  <a key="monitor">Monitor</a>,
                ]}
              >
                <List.Item.Meta
                  avatar={(
                    <Avatar
                      size={40}
                      style={{ background: type.color }}
                      icon={type.icon}
                    />
                  )}
                  title={(
                    <Space>
                      <Text strong>{item.name}</Text>
                      <Tag color={type.color}>{type.label}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.version}
                      </Text>
                    </Space>
                  )}
                  description={(
                    <Space orientation="vertical" size={2}>
                      <Text type="secondary">{item.description}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Instances:
                        {' '}
                        {item.instances}
                        {' '}
                        · Updated
                        {' '}
                        {item.updatedAt}
                      </Text>
                    </Space>
                  )}
                />
              </List.Item>
            )
          }}
        />
      </Card>
    </PageContainer>
  )
}
