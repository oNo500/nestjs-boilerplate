import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Avatar, Col, Divider, List, Row, Statistic, Tag, theme, Typography } from 'antd'
import { PlusCircle } from 'lucide-react'

import { useAuthStore } from '@/features/auth'
import { useWorkplace } from '@/features/dashboard/api/use-dashboard'

export function DashboardWorkplacePage() {
  const { token } = theme.useToken()
  const user = useAuthStore((state) => state.user)
  const { data: workplace } = useWorkplace()

  const workplaceProjects = workplace?.projects ?? []
  const workplaceActivities = workplace?.activities ?? []
  const workplaceTeams = workplace?.teams ?? []
  const workplaceLinks = workplace?.links ?? []

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 6) return 'Working late'
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <PageContainer header={{ title: 'Workplace', breadcrumb: {} }}>
      {/* Welcome card */}
      <ProCard bordered style={{ marginBottom: 16 }}>
        <Row align="middle" gutter={16}>
          <Col flex="none">
            <Avatar
              size={64}
              src={user?.image ?? undefined}
              style={{ backgroundColor: token.colorPrimary, fontSize: 24 }}
            >
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </Avatar>
          </Col>
          <Col flex="auto">
            <Typography.Title level={4} style={{ margin: 0 }}>
              {greeting}
              ,
              {' '}
              {user?.email ?? 'User'}
              . Have a great day!
            </Typography.Title>
            <Typography.Text type="secondary">
              {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? 'Administrator' : 'Regular User'}
              {' '}
              | System Management Platform
            </Typography.Text>
          </Col>
          <Col flex="none">
            <Row gutter={48}>
              <Col>
                <Statistic title="Projects" value={56} />
              </Col>
              <Col>
                <Statistic title="Team Rank" value="8/24" />
              </Col>
              <Col>
                <Statistic title="Project Views" value={2223} />
              </Col>
            </Row>
          </Col>
        </Row>
      </ProCard>

      <Row gutter={16}>
        {/* Left column: active projects + activity feed */}
        <Col span={16}>
          <ProCard title="Active Projects" extra={<a href="#">All Projects</a>} bordered style={{ marginBottom: 16 }}>
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={workplaceProjects}
              renderItem={(item) => (
                <List.Item>
                  <ProCard bordered size="small" style={{ borderRadius: token.borderRadius }}>
                    <List.Item.Meta
                      avatar={(
                        <Avatar
                          size="small"
                          style={{ backgroundColor: token.colorPrimary }}
                        >
                          {item.name[0]}
                        </Avatar>
                      )}
                      title={<Typography.Link>{item.name}</Typography.Link>}
                      description={(
                        <Typography.Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                          {item.desc}
                        </Typography.Text>
                      )}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: token.colorTextSecondary }}>
                      <Typography.Link style={{ fontSize: 12 }}>{item.team}</Typography.Link>
                      <span style={{ marginLeft: 8 }}>{item.updatedAt}</span>
                    </div>
                  </ProCard>
                </List.Item>
              )}
            />
          </ProCard>

          <ProCard title="Activity Feed" bordered>
            <List
              dataSource={workplaceActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={(
                      <Avatar size="small" style={{ backgroundColor: token.colorWarning }}>
                        {item.user[0]}
                      </Avatar>
                    )}
                    description={(
                      <Typography.Text style={{ fontSize: 13 }}>
                        <Typography.Text strong>{item.user}</Typography.Text>
                        {' '}
                        {item.action}
                        {' '}
                        <Typography.Link>{item.project}</Typography.Link>
                        {item.item && (
                          <>
                            {' '}
                            created
                            {' '}
                            <Typography.Link>{item.item}</Typography.Link>
                          </>
                        )}
                        <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                          {item.time}
                        </Typography.Text>
                      </Typography.Text>
                    )}
                  />
                </List.Item>
              )}
            />
          </ProCard>
        </Col>

        {/* Right column: quick links + teams */}
        <Col span={8}>
          <ProCard title="Quick Start / Navigation" bordered style={{ marginBottom: 16 }}>
            <Row gutter={[8, 8]}>
              {workplaceLinks.map((link) => (
                <Col span={8} key={link.title}>
                  <Tag
                    color="blue"
                    style={{ width: '100%', textAlign: 'center', cursor: 'pointer', padding: '4px 0' }}
                  >
                    {link.title}
                  </Tag>
                </Col>
              ))}
              <Col span={8}>
                <Tag
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: '4px 0',
                    border: `1px dashed ${token.colorBorder}`,
                    color: token.colorTextSecondary,
                  }}
                >
                  <PlusCircle size={12} style={{ marginRight: 4 }} />
                  Add
                </Tag>
              </Col>
            </Row>
          </ProCard>

          <ProCard title="Teams" bordered>
            <List
              grid={{ gutter: 8, column: 2 }}
              dataSource={workplaceTeams}
              renderItem={(item) => (
                <List.Item style={{ marginBottom: 8 }}>
                  <Row align="middle" gutter={8} wrap={false}>
                    <Col>
                      <Avatar size="small" style={{ backgroundColor: token.colorPrimary, fontSize: 12 }}>
                        {item.abbr}
                      </Avatar>
                    </Col>
                    <Col>
                      <Typography.Link ellipsis style={{ fontSize: 13 }}>{item.name}</Typography.Link>
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </ProCard>
        </Col>
      </Row>

      <Divider style={{ margin: '16px 0 0' }} />
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        XX Index:
        <Typography.Text strong>12</Typography.Text>
      </Typography.Text>
    </PageContainer>
  )
}
