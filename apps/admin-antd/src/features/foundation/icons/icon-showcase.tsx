import {
  Antdesign,
  Github,
  Nestjs,
  Nextdotjs,
  Openapiinitiative,
  React,
  Refinedgithub,
  Shadcnui,
  Tailwindcss,
  Typescript,
} from '@workspace/icons'
import { Card, Col, Row, Typography, Flex } from 'antd'

const { Text } = Typography

const icons = [
  { name: 'Antdesign', component: Antdesign },
  { name: 'Github', component: Github },
  { name: 'Nestjs', component: Nestjs },
  { name: 'Nextdotjs', component: Nextdotjs },
  { name: 'Openapiinitiative', component: Openapiinitiative },
  { name: 'React', component: React },
  { name: 'Refinedgithub', component: Refinedgithub },
  { name: 'Shadcnui', component: Shadcnui },
  { name: 'Tailwindcss', component: Tailwindcss },
  { name: 'Typescript', component: Typescript },
]

export function IconShowcase() {
  return (
    <Card title="@workspace/icons">
      <Row gutter={[16, 16]}>
        {icons.map(({ name, component: Icon }) => (
          <Col key={name} xs={12} sm={8} md={6} lg={4}>
            <Flex vertical align="center" gap={8} style={{ padding: '16px 8px' }}>
              <Icon width={40} height={40} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {name}
              </Text>
            </Flex>
          </Col>
        ))}
      </Row>
    </Card>
  )
}
