import { ProTable } from '@ant-design/pro-components'
import { Space, Button, Popconfirm } from 'antd'
import { Edit, Eye, Trash2, Plus } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useDeleteUser } from '@/features/users/api/use-delete-user'
import { getUsers } from '@/features/users/api/use-users'

import { UserForm } from './user-form'

import type { User } from '@/features/users/types'
import type { ProColumns, ActionType } from '@ant-design/pro-components'

export function UsersTable() {
  const actionRef = useRef<ActionType>(null)
  const navigate = useNavigate()
  const deleteMutation = useDeleteUser()
  const { t } = useTranslation('users')
  const { t: tCommon } = useTranslation('common')

  const handleDelete = (id: string) => {
    void deleteMutation.mutateAsync({ params: { path: { id } } }).then(() => {
      void actionRef.current?.reload()
    })
  }

  const handleSuccess = () => {
    void actionRef.current?.reload()
  }

  const columns: ProColumns<User>[] = [
    {
      title: t('fields.id'),
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: t('fields.name'),
      dataIndex: 'name',
      width: 120,
    },
    {
      title: t('fields.email'),
      dataIndex: 'email',
      width: 200,
      search: false,
    },
    {
      title: t('fields.role'),
      dataIndex: 'role',
      width: 100,
      valueType: 'select',
      valueEnum: {
        admin: { text: t('role.admin'), status: 'Error' },
        user: { text: t('role.user'), status: 'Default' },
      },
    },
    {
      title: t('fields.status'),
      dataIndex: 'banned',
      width: 100,
      valueType: 'select',
      valueEnum: {
        false: { text: t('status.normal'), status: 'Success' },
        true: { text: t('status.banned'), status: 'Error' },
      },
    },
    {
      title: t('fields.createdAt'),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 180,
      search: false,
    },
    {
      title: tCommon('actions.edit'),
      valueType: 'option',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => void navigate(`/system/users/${record.id}`)}
          >
            {tCommon('actions.view')}
          </Button>
          <UserForm
            mode="edit"
            initialValues={record}
            onSuccess={handleSuccess}
            trigger={(
              <Button type="link" size="small" icon={<Edit size={14} />}>
                {tCommon('actions.edit')}
              </Button>
            )}
          />
          <Popconfirm
            title={t('actions.confirmDelete')}
            description={t('actions.confirmDeleteDesc', { name: record.name })}
            onConfirm={() => handleDelete(record.id)}
            okText={tCommon('actions.confirm')}
            cancelText={tCommon('actions.cancel')}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<Trash2 size={14} />}
              loading={deleteMutation.isPending}
            >
              {tCommon('actions.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <ProTable<User>
      columns={columns}
      actionRef={actionRef}
      request={async (params, sort) => {
        type SearchParams = { name?: string, role?: string, banned?: string }
        const { name, role, banned } = params as SearchParams

        const sortField = Object.keys(sort ?? {})[0]
        const sortOrder = sortField ? sort[sortField] : undefined

        const response = await getUsers({
          page: params.current ?? 1,
          pageSize: params.pageSize ?? 10,
          ...(name && { search: name }),
          ...(role && { role }),
          ...(banned !== undefined && { banned: banned === 'true' }),
          ...(sortField && sortOrder && {
            sortBy: sortField,
            sortOrder: sortOrder === 'ascend' ? 'asc' : 'desc',
          }),
        })

        return {
          data: response?.data ?? [],
          success: true,
          total: response?.total ?? 0,
        }
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
      }}
      dateFormatter="string"
      toolBarRender={() => [
        <UserForm
          key="create"
          mode="create"
          onSuccess={handleSuccess}
          trigger={(
            <Button type="primary" icon={<Plus size={16} />}>
              {t('actions.create')}
            </Button>
          )}
        />,
      ]}
    />
  )
}
