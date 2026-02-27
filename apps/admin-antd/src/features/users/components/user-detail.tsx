import { ProDescriptions } from '@ant-design/pro-components'
import { Button, Result, Skeleton, Tag } from 'antd'
import { useTranslation } from 'react-i18next'

import { useUser } from '@/features/users/api/use-user'

interface UserDetailProperties {
  id: string
}

export function UserDetail({ id }: UserDetailProperties) {
  const { data: user, isLoading, isError, refetch } = useUser(id)
  const { t } = useTranslation('users')
  const { t: tCommon } = useTranslation('common')

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />
  }

  if (isError || !user) {
    return (
      <Result
        status="error"
        title={t('detail.loadFailed')}
        subTitle={t('detail.loadFailedDesc')}
        extra={<Button onClick={() => void refetch()}>{tCommon('actions.retry')}</Button>}
      />
    )
  }

  return (
    <ProDescriptions
      title={t('detail.title')}
      dataSource={user}
      columns={[
        {
          title: t('fields.id'),
          dataIndex: 'id',
          valueType: 'text',
        },
        {
          title: t('fields.name'),
          dataIndex: 'name',
          valueType: 'text',
        },
        {
          title: t('fields.email'),
          dataIndex: 'email',
          valueType: 'text',
        },
        {
          title: t('fields.role'),
          dataIndex: 'role',
          render: (_, record) => (
            <Tag color={record.role === 'admin' ? 'red' : 'default'}>
              {record.role === 'admin' ? t('role.admin') : t('role.user')}
            </Tag>
          ),
        },
        {
          title: t('fields.status'),
          dataIndex: 'banned',
          render: (_, record) => (
            <Tag color={record.banned ? 'error' : 'success'}>
              {record.banned ? t('status.banned') : t('status.normal')}
            </Tag>
          ),
        },
        {
          title: t('fields.createdAt'),
          dataIndex: 'createdAt',
          valueType: 'dateTime',
        },
        {
          title: t('fields.updatedAt'),
          dataIndex: 'updatedAt',
          valueType: 'dateTime',
        },
      ]}
    />
  )
}
