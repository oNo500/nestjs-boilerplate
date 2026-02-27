import { PageContainer } from '@ant-design/pro-components'
import { Avatar, Card, Col, Input, Row, Select, Space, Tag, Typography } from 'antd'

const { Text, Title, Paragraph } = Typography

interface Project {
  id: string
  name: string
  description: string
  owner: string
  members: number
  status: 'active' | 'paused' | 'completed'
  tech: string[]
  updatedAt: string
  avatar: string
}

const projects: Project[] = [
  {
    id: '1',
    name: 'Admin Dashboard',
    description: 'Enterprise-grade management portal built with React and Ant Design, featuring full user permissions and data management.',
    owner: 'Alice Zhang',
    members: 6,
    status: 'active',
    tech: ['React', 'TypeScript', 'NestJS'],
    updatedAt: '2023-12-01',
    avatar: 'A',
  },
  {
    id: '2',
    name: 'API Gateway Service',
    description: 'Unified gateway layer for all microservice APIs, providing authentication, rate limiting, and logging.',
    owner: 'Bob Li',
    members: 3,
    status: 'active',
    tech: ['Node.js', 'Docker', 'Nginx'],
    updatedAt: '2023-11-28',
    avatar: 'B',
  },
  {
    id: '3',
    name: 'Data Analytics Platform',
    description: 'Real-time data collection and analysis system with custom reporting and dashboard visualization.',
    owner: 'Eve Wang',
    members: 8,
    status: 'paused',
    tech: ['Python', 'ClickHouse', 'Grafana'],
    updatedAt: '2023-11-15',
    avatar: 'C',
  },
  {
    id: '4',
    name: 'Mobile App',
    description: 'Consumer-facing mobile application supporting both iOS and Android platforms.',
    owner: 'Leo Zhao',
    members: 5,
    status: 'completed',
    tech: ['React Native', 'Redux', 'Jest'],
    updatedAt: '2023-10-30',
    avatar: 'D',
  },
  {
    id: '5',
    name: 'CI/CD Pipeline',
    description: 'Automated build, test, and deployment pipeline to improve development efficiency and delivery quality.',
    owner: 'Chris Sun',
    members: 2,
    status: 'active',
    tech: ['GitHub Actions', 'Docker', 'K8s'],
    updatedAt: '2023-12-05',
    avatar: 'E',
  },
  {
    id: '6',
    name: 'Notification Service',
    description: 'Unified push notification service supporting email, SMS, and in-app messages, handling millions of messages daily.',
    owner: 'Frank Zhou',
    members: 4,
    status: 'active',
    tech: ['RabbitMQ', 'Redis', 'Node.js'],
    updatedAt: '2023-11-20',
    avatar: 'F',
  },
]

const statusConfig: Record<Project['status'], { label: string, color: string }> = {
  active: { label: 'Active', color: 'green' },
  paused: { label: 'Paused', color: 'orange' },
  completed: { label: 'Completed', color: 'blue' },
}

const avatarColors = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']

export function ListSearchProjectsPage() {
  return (
    <PageContainer header={{ title: 'Search List (Projects)', breadcrumb: {} }}>
      <Card variant="borderless" style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Input.Search placeholder="Search project name" style={{ width: 300 }} />
          <Select
            placeholder="Project status"
            style={{ width: 140 }}
            options={[
              { label: 'All', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Paused', value: 'paused' },
              { label: 'Completed', value: 'completed' },
            ]}
          />
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {projects.map((project, idx) => (
          <Col key={project.id} xs={24} sm={12} lg={8}>
            <Card
              variant="borderless"
              hoverable
              actions={[
                <a key="detail">Details</a>,
                <a key="edit">Edit</a>,
                <a key="members">
                  Members(
                  {project.members}
                  )
                </a>,
              ]}
            >
              <Card.Meta
                avatar={(
                  <Avatar
                    size={48}
                    style={{ background: avatarColors[idx % avatarColors.length] }}
                  >
                    {project.avatar}
                  </Avatar>
                )}
                title={(
                  <Space>
                    <Text strong>{project.name}</Text>
                    <Tag color={statusConfig[project.status].color}>
                      {statusConfig[project.status].label}
                    </Tag>
                  </Space>
                )}
                description={(
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    type="secondary"
                    style={{ marginBottom: 8, minHeight: 44 }}
                  >
                    {project.description}
                  </Paragraph>
                )}
              />
              <Space wrap style={{ marginTop: 12 }}>
                {project.tech.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </Space>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Owner:
                  {' '}
                  {project.owner}
                  {' '}
                  · Updated
                  {' '}
                  {project.updatedAt}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Title level={5} type="secondary">
          Total
          {' '}
          {projects.length}
          {' '}
          projects
        </Title>
      </div>
    </PageContainer>
  )
}
