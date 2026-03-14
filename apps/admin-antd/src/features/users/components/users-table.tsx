import { ProTable } from '@ant-design/pro-components'
import { Space, Button, Popconfirm } from 'antd'
import { Edit, Eye, Trash2, Plus } from 'lucide-react'
import { useRef } from 'react'
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
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: 'Username',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 200,
      search: false,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      width: 100,
      valueType: 'select',
      valueEnum: {
        admin: { text: 'Administrator', status: 'Error' },
        user: { text: 'User', status: 'Default' },
      },
    },
    {
      title: 'Status',
      dataIndex: 'banned',
      width: 100,
      valueType: 'select',
      valueEnum: {
        false: { text: 'Normal', status: 'Success' },
        true: { text: 'Banned', status: 'Error' },
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 180,
      search: false,
    },
    {
      title: 'Edit',
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
            View
          </Button>
          <UserForm
            mode="edit"
            initialValues={record}
            onSuccess={handleSuccess}
            trigger={(
              <Button type="link" size="small" icon={<Edit size={14} />}>
                Edit
              </Button>
            )}
          />
          <Popconfirm
            title="Confirm Delete"
            description={`Are you sure you want to delete user "${record.name}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="OK"
            cancelText="Cancel"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<Trash2 size={14} />}
              loading={deleteMutation.isPending}
            >
              Delete
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
              Create User
            </Button>
          )}
        />,
      ]}
    />
  )
}
