import { ProTable } from '@ant-design/pro-components'
import { Tag, Typography } from 'antd'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { getLoginLogs } from '@/features/login-logs/api/use-login-logs'
import { getStatusColor } from '@/features/login-logs/utils/status-color'

import type { LoginLog, GetLoginLogsParams } from '@/features/login-logs/types'
import type { ProColumns, ActionType } from '@ant-design/pro-components'

const { Text } = Typography

export function LoginLogsTable() {
  const actionRef = useRef<ActionType>(null)
  const { t } = useTranslation('login-logs')

  const columns: ProColumns<LoginLog>[] = [
    {
      title: t('fields.createdAt'),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 180,
      search: false,
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: t('fields.email'),
      dataIndex: 'email',
      width: 220,
      render: (_, record) => <Text>{record.email}</Text>,
    },
    {
      title: t('fields.status'),
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        success: { text: t('status.success') },
        failed: { text: t('status.failed') },
      },
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>{t(`status.${record.status}`)}</Tag>
      ),
    },
    {
      title: t('fields.ipAddress'),
      dataIndex: 'ipAddress',
      width: 130,
      search: false,
      render: (_, record) => <Text>{record.ipAddress ?? '-'}</Text>,
    },
    {
      title: t('fields.failReason'),
      dataIndex: 'failReason',
      width: 200,
      search: false,
      render: (_, record) =>
        record.status === 'failed'
          ? (
              <Text type="danger">{record.failReason ?? '-'}</Text>
            )
          : (
              <Text type="secondary">-</Text>
            ),
    },
  ]

  return (
    <ProTable<LoginLog>
      columns={columns}
      actionRef={actionRef}
      request={async (params: GetLoginLogsParams & { current?: number, pageSize?: number }) => {
        const response = await getLoginLogs({
          page: params.current ?? 1,
          pageSize: params.pageSize ?? 20,
          ...(params.email && { email: params.email }),
          ...(params.status && { status: params.status }),
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
        defaultPageSize: 20,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
      }}
      dateFormatter="string"
      toolBarRender={false}
    />
  )
}
