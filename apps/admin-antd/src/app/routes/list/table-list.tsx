import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  StepsForm,
} from '@ant-design/pro-components'
import { Button, Drawer, Input, message } from 'antd'
import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'

import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components'
import type React from 'react'

interface RuleItem {
  key: number
  disabled?: boolean
  name: string
  desc: string
  callNo: number
  status: string
  updatedAt: string
  createdAt: string
  progress: number
}

interface UpdateFormValues {
  name?: string
  desc?: string
  target?: string
  template?: string
  type?: string
  time?: string
  frequency?: string
}

const genList = (count: number): RuleItem[] =>
  Array.from({ length: count }, (_, i) => ({
    key: i,
    disabled: i % 6 === 0,
    name: `TradeCode ${i}`,
    desc: 'This is a description.',
    callNo: Math.floor(Math.random() * 1000),
    status: String(Math.floor(Math.random() * 4)),
    updatedAt: '2024-11-28 08:00:00',
    createdAt: '2024-01-01 00:00:00',
    progress: Math.ceil(Math.random() * 100),
  }))

const statusEnum = {
  0: { text: 'Closed', status: 'Default' },
  1: { text: 'Running', status: 'Processing' },
  2: { text: 'Online', status: 'Success' },
  3: { text: 'Error', status: 'Error' },
} as const

interface UpdateFormProps {
  open: boolean
  values: Partial<RuleItem>
  onCancel: () => void
  onFinish: (vals: UpdateFormValues) => Promise<boolean>
}

function UpdateForm({ open, values, onCancel, onFinish }: UpdateFormProps) {
  return (
    <StepsForm<UpdateFormValues>
      stepsProps={{ size: 'small' }}
      stepsFormRender={(dom, submitter) => (
        <Drawer
          title="Rule Configuration"
          size={640}
          open={open}
          onClose={onCancel}
          footer={<div style={{ textAlign: 'right' }}>{submitter}</div>}
        >
          {dom}
        </Drawer>
      )}
      onFinish={onFinish}
    >
      <StepsForm.StepForm<UpdateFormValues>
        title="Basic Info"
        initialValues={{ name: values.name, desc: values.desc }}
      >
        <ProFormText
          name="name"
          label="Rule Name"
          width="md"
          rules={[{ required: true, message: 'Please enter a rule name' }]}
        />
        <ProFormTextArea
          name="desc"
          label="Rule Description"
          width="md"
          rules={[{ required: true, min: 5, message: 'Description must be at least 5 characters' }]}
        />
      </StepsForm.StepForm>

      <StepsForm.StepForm<UpdateFormValues>
        title="Rule Properties"
        initialValues={{ target: '0', template: '0' }}
      >
        <ProFormSelect
          name="target"
          label="Monitor Target"
          width="md"
          valueEnum={{ 0: 'Table A', 1: 'Table B' }}
        />
        <ProFormSelect
          name="template"
          label="Rule Template"
          width="md"
          valueEnum={{ 0: 'Template A', 1: 'Template B' }}
        />
        <ProFormRadio.Group
          name="type"
          label="Rule Type"
          options={[
            { value: '0', label: 'Strong' },
            { value: '1', label: 'Weak' },
          ]}
        />
      </StepsForm.StepForm>

      <StepsForm.StepForm<UpdateFormValues>
        title="Schedule"
        initialValues={{ frequency: 'month' }}
      >
        <ProFormSelect
          name="frequency"
          label="Frequency"
          width="md"
          valueEnum={{ month: 'Monthly', week: 'Weekly' }}
        />
      </StepsForm.StepForm>
    </StepsForm>
  )
}

export function ListTableListPage() {
  const actionRef = useRef<ActionType>(null)
  const [data, setData] = useState<RuleItem[]>(() => genList(100))
  const dataRef = useRef<RuleItem[]>(data)

  const [createOpen, setCreateOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<RuleItem | undefined>()
  const [selectedRows, setSelectedRows] = useState<RuleItem[]>([])

  const syncData = (next: RuleItem[]) => {
    dataRef.current = next
    setData(next)
  }

  const columns: ProColumns<RuleItem>[] = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      tip: 'Rule name is the unique key',
      render: (dom, entity) => (
        <a
          onClick={() => {
            setCurrentRow(entity)
            setDetailOpen(true)
          }}
        >
          {dom}
        </a>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      valueType: 'textarea',
      search: false,
    },
    {
      title: 'Service Calls',
      dataIndex: 'callNo',
      sorter: true,
      search: false,
      renderText: (val: number) => `${val}k`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueEnum: statusEnum,
    },
    {
      title: 'Last Scheduled',
      dataIndex: 'updatedAt',
      sorter: true,
      valueType: 'dateTime',
      search: false,
      renderFormItem: (_item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status') as string
        if (status === '0') return false
        if (status === '3') return <Input {...rest} placeholder="Enter error reason" />
        return defaultRender(_item) as React.ReactNode
      },
    },
    {
      title: 'Actions',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            setCurrentRow(record)
            setUpdateOpen(true)
          }}
        >
          Configure
        </a>,
        <a
          key="delete"
          onClick={() => {
            syncData(dataRef.current.filter((item) => item.key !== record.key))
            void message.success('Deleted successfully')
            void actionRef.current?.reloadAndRest?.()
          }}
        >
          Delete
        </a>,
      ],
    },
  ]

  return (
    <PageContainer header={{ title: 'Table List', breadcrumb: {} }}>
      <ProTable<RuleItem>
        headerTitle="Rule List"
        actionRef={actionRef}
        rowKey="key"
        search={{ labelWidth: 120 }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setCreateOpen(true)}
          >
            New
          </Button>,
        ]}
        request={(params) => {
          const { current = 1, pageSize = 10, name, status } = params as { current?: number, pageSize?: number, name?: string, status?: string }
          let filtered = dataRef.current
          if (name) filtered = filtered.filter((r) => r.name.includes(name))
          if (status) filtered = filtered.filter((r) => r.status === status)
          const start = (current - 1) * pageSize
          return Promise.resolve({
            data: filtered.slice(start, start + pageSize),
            total: filtered.length,
            success: true,
          })
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
      />

      {selectedRows.length > 0 && (
        <FooterToolbar
          extra={(
            <span>
              Selected
              {' '}
              <a style={{ fontWeight: 600 }}>{selectedRows.length}</a>
              {' '}
              items
              &nbsp;&nbsp;Total service calls:
              {' '}
              {selectedRows.reduce((sum, r) => sum + r.callNo, 0)}
              k
            </span>
          )}
        >
          <Button
            onClick={() => {
              const keys = new Set(selectedRows.map((r) => r.key))
              syncData(dataRef.current.filter((r) => !keys.has(r.key)))
              setSelectedRows([])
              void message.success('Batch deleted successfully')
              void actionRef.current?.reloadAndRest?.()
            }}
          >
            Batch Delete
          </Button>
          <Button type="primary">Batch Approve</Button>
        </FooterToolbar>
      )}

      <ModalForm<{ name: string, desc: string }>
        title="New Rule"
        width={400}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onFinish={(values) => {
          const newItem: RuleItem = {
            key: Date.now(),
            name: values.name,
            desc: values.desc,
            callNo: Math.floor(Math.random() * 1000),
            status: '1',
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            progress: 0,
          }
          syncData([newItem, ...dataRef.current])
          void message.success('Created successfully')
          void actionRef.current?.reloadAndRest?.()
          return Promise.resolve(true)
        }}
      >
        <ProFormText
          name="name"
          label="Rule Name"
          width="md"
          rules={[{ required: true, message: 'Please enter a rule name' }]}
        />
        <ProFormTextArea name="desc" label="Rule Description" width="md" />
      </ModalForm>

      <UpdateForm
        open={updateOpen}
        values={currentRow ?? {}}
        onCancel={() => {
          setUpdateOpen(false)
          setCurrentRow(undefined)
        }}
        onFinish={(values) => {
          if (!currentRow) return Promise.resolve(false)
          syncData(
            dataRef.current.map((r) =>
              r.key === currentRow.key ? { ...r, ...values } : r,
            ),
          )
          void message.success('Updated successfully')
          setUpdateOpen(false)
          setCurrentRow(undefined)
          void actionRef.current?.reload()
          return Promise.resolve(true)
        }}
      />

      <Drawer
        size={600}
        open={detailOpen}
        onClose={() => {
          setCurrentRow(undefined)
          setDetailOpen(false)
        }}
        closable={false}
      >
        {currentRow && (
          <ProDescriptions<RuleItem>
            column={2}
            title={currentRow.name}
            request={() => Promise.resolve({ data: currentRow })}
            columns={columns as ProDescriptionsItemProps<RuleItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  )
}
