import { ProTable } from '@ant-design/pro-components'
import { Tag, Typography } from 'antd'
import { useRef } from 'react'

import { getAuditLogs } from '@/features/audit-logs/api/use-audit-logs'
import { getActionColor } from '@/features/audit-logs/utils/action-color'

import type { AuditLog, GetAuditLogsParams } from '@/features/audit-logs/types'
import type { ProColumns, ActionType } from '@ant-design/pro-components'

const { Text } = Typography

export function AuditLogsTable() {
  const actionRef = useRef<ActionType>(null)

  const columns: ProColumns<AuditLog>[] = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 180,
      search: false,
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Operator',
      dataIndex: 'actorEmail',
      width: 200,
      search: false,
      render: (_, record) => <Text>{record.actorEmail ?? '-'}</Text>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 220,
      render: (_, record) => (
        <Tag color={getActionColor(record.action)}>{record.action}</Tag>
      ),
    },
    {
      title: 'Resource Type',
      dataIndex: 'resourceType',
      width: 120,
      search: false,
      render: (_, record) => <Text type="secondary">{record.resourceType ?? '-'}</Text>,
    },
    {
      title: 'Resource ID',
      dataIndex: 'resourceId',
      width: 280,
      search: false,
      render: (_, record) => <Text type="secondary">{record.resourceId ?? '-'}</Text>,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      width: 130,
      search: false,
      render: (_, record) => <Text>{record.ipAddress ?? '-'}</Text>,
    },
  ]

  return (
    <ProTable<AuditLog>
      columns={columns}
      actionRef={actionRef}
      request={async (params: GetAuditLogsParams & { current?: number, pageSize?: number, action?: string }) => {
        const response = await getAuditLogs({
          page: params.current ?? 1,
          pageSize: params.pageSize ?? 20,
          ...(params.action && { action: params.action }),
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
      expandable={{
        expandedRowRender: (record) => (
          <Typography.Paragraph>
            <Text strong>Details:</Text>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {record.detail ? JSON.stringify(record.detail, null, 2) : 'None'}
            </pre>
          </Typography.Paragraph>
        ),
        rowExpandable: (record) => record.detail !== null && record.detail !== undefined,
      }}
    />
  )
}
