import {
  Card,
  Space,
  Button,
  Input,
  Select,
  Tag,
  Badge,
  Switch,
  Slider,
  Progress,
  Alert,
  Tooltip,
  Popconfirm,
  Typography,
  Divider,
  Avatar,
  Rate,
} from 'antd'
import { Search, Plus, Trash2 } from 'lucide-react'

const { Title, Text } = Typography

export function AntdShowcase() {
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Card
        size="small"
        title={<Title level={5} style={{ margin: 0 }}>Button</Title>}
      >
        <Space wrap>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="link">Link</Button>
          <Button type="text">Text</Button>
          <Button danger>Danger</Button>
          <Button type="primary" icon={<Plus size={14} />}>Add</Button>
          <Button icon={<Trash2 size={14} />} danger>Delete</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Space>
      </Card>

      <Card
        size="small"
        title={<Title level={5} style={{ margin: 0 }}>Input / Select</Title>}
      >
        <Space wrap>
          <Input placeholder="Default input" style={{ width: 180 }} />
          <Input placeholder="With icon" prefix={<Search size={14} />} style={{ width: 180 }} />
          <Input.Password placeholder="Password" style={{ width: 180 }} />
          <Select
            placeholder="Please select"
            style={{ width: 150 }}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'User' },
            ]}
          />
        </Space>
      </Card>

      <Card
        size="small"
        title={<Title level={5} style={{ margin: 0 }}>Tag / Badge / Avatar</Title>}
      >
        <Space wrap>
          <Tag>Default</Tag>
          <Tag color="blue">Blue</Tag>
          <Tag color="green">Green</Tag>
          <Tag color="red">Red</Tag>
          <Tag color="orange">Orange</Tag>
          <Tag color="purple">Purple</Tag>
          <Divider orientation="vertical" />
          <Badge count={5}><Avatar>U</Avatar></Badge>
          <Badge dot><Avatar>A</Avatar></Badge>
          <Badge status="success" text="Online" />
          <Badge status="error" text="Offline" />
          <Badge status="processing" text="Processing" />
        </Space>
      </Card>

      <Card
        size="small"
        title={<Title level={5} style={{ margin: 0 }}>Switch / Rate / Progress</Title>}
      >
        <Space wrap align="center">
          <Switch defaultChecked />
          <Switch />
          <Divider orientation="vertical" />
          <Rate defaultValue={3} />
          <Divider orientation="vertical" />
          <Progress percent={60} style={{ width: 200 }} />
          <Progress percent={100} style={{ width: 200 }} />
          <Progress percent={40} status="exception" style={{ width: 200 }} />
        </Space>
      </Card>

      <Card
        size="small"
        title={<Title level={5} style={{ margin: 0 }}>Slider</Title>}
      >
        <Slider defaultValue={40} style={{ maxWidth: 400 }} />
      </Card>

      <Card
        size="small"
        title={<Title level={5} style={{ margin: 0 }}>Alert</Title>}
      >
        <Space orientation="vertical" style={{ width: '100%' }}>
          <Alert title="Success" type="success" showIcon />
          <Alert title="Info" type="info" showIcon />
          <Alert title="Warning" type="warning" showIcon />
          <Alert title="Error" type="error" showIcon />
        </Space>
      </Card>

      <Card
        size="small"
        title={<Title level={5} style={{ margin: 0 }}>Tooltip / Popconfirm</Title>}
      >
        <Space>
          <Tooltip title="This is a tooltip">
            <Button>Hover me</Button>
          </Tooltip>
          <Popconfirm title="Confirm action?" okText="OK" cancelText="Cancel">
            <Button danger>Popconfirm</Button>
          </Popconfirm>
        </Space>
      </Card>

      <Card
        size="small"
        title={<Title level={5} style={{ margin: 0 }}>Typography</Title>}
      >
        <Space orientation="vertical">
          <Title level={1} style={{ margin: 0 }}>H1 Heading</Title>
          <Title level={2} style={{ margin: 0 }}>H2 Heading</Title>
          <Title level={3} style={{ margin: 0 }}>H3 Heading</Title>
          <Title level={4} style={{ margin: 0 }}>H4 Heading</Title>
          <Title level={5} style={{ margin: 0 }}>H5 Heading</Title>
          <Text>Body text</Text>
          <Text type="secondary">Secondary text</Text>
          <Text type="success">Success text</Text>
          <Text type="warning">Warning text</Text>
          <Text type="danger">Danger text</Text>
          <Text code>code text</Text>
          <Text mark>mark text</Text>
          <Text underline>Underline text</Text>
          <Text delete>Strikethrough text</Text>
          <Text strong>Bold text</Text>
        </Space>
      </Card>
    </Space>
  )
}
