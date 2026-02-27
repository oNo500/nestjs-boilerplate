import { ModalForm, PageContainer, ProFormText, ProFormTextArea } from '@ant-design/pro-components'
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  List,
  Progress,
  Result,
  Row,
  Segmented,
  Space,
  theme,
  Typography,
} from 'antd'
import { Plus } from 'lucide-react'
import { useState } from 'react'

const { Text } = Typography

interface ListItem {
  id: string
  title: string
  description: string
  owner: string
  time: string
  percent: number
  status: 'active' | 'exception' | 'normal'
  href: string
  avatar: string
}

const initData: ListItem[] = [
  {
    id: '1',
    title: 'Alipay',
    description: 'There is something intrinsic about it — what on earth keeps people so captivated.',
    owner: 'Alice Fu',
    time: '2016-08-05',
    percent: 82,
    status: 'active',
    href: 'https://ant.design',
    avatar: 'A',
  },
  {
    id: '2',
    title: 'Angular',
    description: 'Hope is a good thing, maybe the best of things, and no good thing ever dies.',
    owner: 'Lily Qu',
    time: '2017-03-06',
    percent: 64,
    status: 'active',
    href: 'https://ant.design',
    avatar: 'B',
  },
  {
    id: '3',
    title: 'Ant Design',
    description: 'So many bars in town, yet she chose to walk into mine.',
    owner: 'Dong Lin',
    time: '2016-12-03',
    percent: 92,
    status: 'exception',
    href: 'https://ant.design',
    avatar: 'C',
  },
  {
    id: '4',
    title: 'Ant Design Pro',
    description: 'Back then I only thought about what I wanted, never whether those around me would get hurt.',
    owner: 'Star Zhou',
    time: '2017-01-09',
    percent: 30,
    status: 'normal',
    href: 'https://ant.design',
    avatar: 'D',
  },
  {
    id: '5',
    title: 'Bootstrap',
    description: 'Winter is coming, yet the embrace is still warm.',
    owner: 'Good Wu',
    time: '2017-05-22',
    percent: 54,
    status: 'active',
    href: 'https://ant.design',
    avatar: 'E',
  },
  {
    id: '6',
    title: 'React',
    description: 'Life is like a box of chocolates — you never know what you\'re gonna get.',
    owner: 'Peter Zhu',
    time: '2017-08-09',
    percent: 78,
    status: 'active',
    href: 'https://ant.design',
    avatar: 'F',
  },
]

type ModalDoneStatus = 'list' | 'done'

interface ModalFormValues {
  title: string
  description: string
  owner: string
}

interface ListContentProps {
  item: ListItem
}

function ListContent({ item }: ListContentProps) {
  const { token } = theme.useToken()
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'inline-block', marginLeft: 40 }}>
        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
          Owner
        </Text>
        <Text style={{ fontSize: 14 }}>{item.owner}</Text>
      </div>
      <div style={{ display: 'inline-block', marginLeft: 40 }}>
        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
          Start Date
        </Text>
        <Text style={{ fontSize: 14 }}>{item.time}</Text>
      </div>
      <div style={{ display: 'inline-block', marginLeft: 40, width: 150 }}>
        <Progress
          percent={item.percent}
          status={item.status}
          strokeColor={item.status === 'exception' ? token.colorError : undefined}
        />
      </div>
    </div>
  )
}

export function ListBasicPage() {
  const { token } = theme.useToken()
  const [list, setList] = useState<ListItem[]>(initData)
  const [editItem, setEditItem] = useState<ListItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [doneStatus, setDoneStatus] = useState<ModalDoneStatus>('list')
  const [form] = Form.useForm<ModalFormValues>()

  const handleOpenAdd = () => {
    setEditItem(null)
    setDoneStatus('list')
    form.resetFields()
    setModalOpen(true)
  }

  const handleOpenEdit = (item: ListItem) => {
    setEditItem(item)
    setDoneStatus('list')
    form.setFieldsValue({ title: item.title, description: item.description, owner: item.owner })
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((i) => i.id !== id))
  }

  const handleFinish = (values: ModalFormValues): Promise<boolean> => {
    if (editItem) {
      setList((prev) => prev.map((i) => (i.id === editItem.id ? { ...i, ...values } : i)))
    } else {
      const newItem: ListItem = {
        id: String(Date.now()),
        title: values.title,
        description: values.description,
        owner: values.owner,
        time: new Date().toISOString().slice(0, 10),
        percent: 0,
        status: 'normal',
        href: '',
        avatar: values.title.charAt(0).toUpperCase(),
      }
      setList((prev) => [newItem, ...prev])
    }
    setDoneStatus('done')
    return Promise.resolve(true)
  }

  const extraContent = (
    <Space>
      <Segmented options={['All', 'In Progress', 'Pending']} />
      <Input.Search placeholder="Search" style={{ width: 200 }} />
    </Space>
  )

  const cardContent = (
    <Row gutter={16}>
      {[
        { label: 'My Pending Tasks', value: '8 Tasks' },
        { label: 'Avg. Task Handling Time This Week', value: '32 min' },
        { label: 'Tasks Completed This Week', value: '24 Tasks' },
      ].map((stat, idx) => (
        <Col key={stat.label} xs={24} sm={8}>
          <div
            style={{
              textAlign: 'center',
              padding: '16px 0',
              borderLeft: idx > 0 ? `1px solid ${token.colorSplit}` : undefined,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 600 }}>{stat.value}</div>
            <div style={{ color: token.colorTextSecondary, marginTop: 4 }}>{stat.label}</div>
          </div>
        </Col>
      ))}
    </Row>
  )

  return (
    <PageContainer header={{ title: 'Basic List', breadcrumb: {} }}>
      <Card variant="borderless" style={{ marginBottom: 24 }}>
        {cardContent}
      </Card>

      <Card variant="borderless" extra={extraContent} title="Basic List">
        <List<ListItem>
          size="large"
          rowKey="id"
          dataSource={list}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <a key="edit" onClick={() => handleOpenEdit(item)}>
                  Edit
                </a>,
                <a key="more">More</a>,
                <a key="delete" style={{ color: token.colorError }} onClick={() => handleDelete(item.id)}>
                  Delete
                </a>,
              ]}
            >
              <List.Item.Meta
                avatar={(
                  <Avatar style={{ background: token.colorPrimary }} size="large">
                    {item.avatar}
                  </Avatar>
                )}
                title={<a href={item.href}>{item.title}</a>}
                description={item.description}
              />
              <ListContent item={item} />
            </List.Item>
          )}
        />
        <Divider />
        <Button
          type="dashed"
          block
          icon={<Plus size={14} />}
          onClick={handleOpenAdd}
          style={{ marginBottom: 8 }}
        >
          Add
        </Button>
      </Card>

      <ModalForm<ModalFormValues>
        title={editItem ? 'Edit Task' : 'New Task'}
        form={form}
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) setModalOpen(false)
        }}
        onFinish={handleFinish}
        submitter={
          doneStatus === 'done'
            ? {
                render: () => (
                  <Button type="primary" onClick={() => setModalOpen(false)}>
                    Got It
                  </Button>
                ),
              }
            : undefined
        }
      >
        {doneStatus === 'done'
          ? (
              <Result
                status="success"
                title="Operation Successful"
                subTitle={editItem ? 'Task has been updated' : 'New task has been created'}
              />
            )
          : (
              <>
                <ProFormText
                  name="title"
                  label="Task Name"
                  rules={[{ required: true, message: 'Please enter a task name' }]}
                  placeholder="Enter here"
                />
                <ProFormTextArea
                  name="description"
                  label="Task Description"
                  rules={[{ required: true, message: 'Please enter a task description' }]}
                  placeholder="Enter here"
                />
                <ProFormText
                  name="owner"
                  label="Owner"
                  rules={[{ required: true, message: 'Please enter an owner' }]}
                  placeholder="Enter here"
                />
              </>
            )}
      </ModalForm>
    </PageContainer>
  )
}
