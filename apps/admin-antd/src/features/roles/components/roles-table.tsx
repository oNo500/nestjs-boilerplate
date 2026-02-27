import { ProTable } from '@ant-design/pro-components'
import { Select, Popconfirm, Tag, Space } from 'antd'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/features/auth'
import { useAssignRole } from '@/features/roles/api/use-assign-role'
import { getRoleLabels, getRoleOptions } from '@/features/roles/utils/role-options'
import { getUsers } from '@/features/users/api/use-users'

import type { User } from '@/features/users/types'
import type { ProColumns, ActionType } from '@ant-design/pro-components'

const ROLE_COLORS: Record<string, string> = {
  USER: 'default',
  ADMIN: 'blue',
}

export function RolesTable() {
  const actionRef = useRef<ActionType>(null)
  const { user: currentUser } = useAuthStore()
  const assignRoleMutation = useAssignRole()
  const [pendingRole, setPendingRole] = useState<Record<string, string>>({})
  const { t } = useTranslation('roles')
  const { t: tCommon } = useTranslation('common')

  const roleOptions = getRoleOptions(t)
  const roleLabels = getRoleLabels(t)

  const handleAssignRole = (userId: string, role: string) => {
    void assignRoleMutation
      .mutateAsync({
        params: { path: { id: userId } },
        body: { role: role as never },
      })
      .then(() => {
        setPendingRole((prev) => {
          const next = { ...prev }
          delete next[userId]
          return next
        })
        void actionRef.current?.reload()
      })
      .catch(() => {
        setPendingRole((prev) => {
          const next = { ...prev }
          delete next[userId]
          return next
        })
      })
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
      width: 150,
    },
    {
      title: t('fields.email'),
      dataIndex: 'email',
      width: 200,
      search: false,
    },
    {
      title: t('fields.currentRole'),
      dataIndex: 'role',
      width: 120,
      search: false,
      render: (_, record) => {
        const role = record.role?.toUpperCase() ?? 'USER'
        return <Tag color={ROLE_COLORS[role] ?? 'default'}>{roleLabels[role] ?? role}</Tag>
      },
    },
    {
      title: t('fields.roleAction'),
      valueType: 'option',
      width: 220,
      render: (_, record) => {
        const isSelf = currentUser?.id === record.id
        const currentRole = record.role?.toUpperCase() ?? 'USER'
        const selected = pendingRole[record.id] ?? currentRole

        return (
          <Space size="small">
            <Select
              value={selected}
              options={roleOptions}
              size="small"
              style={{ width: 130 }}
              disabled={isSelf}
              onChange={(value: string) => {
                setPendingRole((prev) => ({ ...prev, [record.id]: value }))
              }}
            />
            {selected !== currentRole && (
              <Popconfirm
                title={t('actions.confirmTitle')}
                description={t('actions.confirmDesc', { role: roleLabels[selected] ?? selected })}
                onConfirm={() => handleAssignRole(record.id, selected)}
                onCancel={() => {
                  setPendingRole((prev) => {
                    const next = { ...prev }
                    delete next[record.id]
                    return next
                  })
                }}
                okText={tCommon('actions.confirm')}
                cancelText={tCommon('actions.cancel')}
              >
                <Tag color="processing" style={{ cursor: 'pointer' }}>
                  {t('actions.save')}
                </Tag>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <ProTable<User>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        const search = (params as { name?: string }).name
        const response = await getUsers({
          page: params.current ?? 1,
          pageSize: params.pageSize ?? 10,
          ...(search && { search }),
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
      toolBarRender={false}
    />
  )
}
