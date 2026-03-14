import { ProDescriptions } from '@ant-design/pro-components'
import { Button, Result, Skeleton, Tag } from 'antd'

import { useUser } from '@/features/users/api/use-user'

interface UserDetailProperties {
  id: string
}

export function UserDetail({ id }: UserDetailProperties) {
  const { data: user, isLoading, isError, refetch } = useUser(id)

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />
  }

  if (isError || !user) {
    return (
      <Result
        status="error"
        title="Load Failed"
        subTitle="Failed to load user info, please try again later"
        extra={<Button onClick={() => void refetch()}>Retry</Button>}
      />
    )
  }

  return (
    <ProDescriptions
      title="Basic Info"
      dataSource={user}
      columns={[
        {
          title: 'ID',
          dataIndex: 'id',
          valueType: 'text',
        },
        {
          title: 'Username',
          dataIndex: 'name',
          valueType: 'text',
        },
        {
          title: 'Email',
          dataIndex: 'email',
          valueType: 'text',
        },
        {
          title: 'Role',
          dataIndex: 'role',
          render: (_, record) => (
            <Tag color={record.role === 'admin' ? 'red' : 'default'}>
              {record.role === 'admin' ? 'Administrator' : 'User'}
            </Tag>
          ),
        },
        {
          title: 'Status',
          dataIndex: 'banned',
          render: (_, record) => (
            <Tag color={record.banned ? 'error' : 'success'}>
              {record.banned ? 'Banned' : 'Normal'}
            </Tag>
          ),
        },
        {
          title: 'Created At',
          dataIndex: 'createdAt',
          valueType: 'dateTime',
        },
        {
          title: 'Updated At',
          dataIndex: 'updatedAt',
          valueType: 'dateTime',
        },
      ]}
    />
  )
}
