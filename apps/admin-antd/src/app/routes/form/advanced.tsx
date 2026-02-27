import {
  EditableProTable,
  FooterToolbar,
  PageContainer,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
  ProFormTimePicker,
} from '@ant-design/pro-components'
import { Card, Col, message, Popover, Row, theme } from 'antd'
import { XCircle } from 'lucide-react'
import { useState } from 'react'

import type { ProColumnType } from '@ant-design/pro-components'

interface TableMember {
  key: string
  workId?: string
  name?: string
  department?: string
}

type InternalNamePath = (string | number)[]

interface ErrorField {
  name: InternalNamePath
  errors: string[]
}

const fieldLabels = {
  name: 'Repository Name',
  url: 'Repository Domain',
  owner: 'Repository Admin',
  approver: 'Approver',
  dateRange: 'Effective Date',
  type: 'Repository Type',
  name2: 'Task Name',
  url2: 'Task Description',
  owner2: 'Assignee',
  approver2: 'Owner',
  dateRange2: 'Effective Date',
  type2: 'Task Type',
} as const

type FieldLabelKey = keyof typeof fieldLabels

const tableData: TableMember[] = [
  { key: '1', workId: '00001', name: 'John Brown', department: 'New York No. 1 Lake Park' },
  { key: '2', workId: '00002', name: 'Jim Green', department: 'London No. 1 Lake Park' },
  { key: '3', workId: '00003', name: 'Joe Black', department: 'Sidney No. 1 Lake Park' },
]

const ownerOptions = [
  { label: 'Alice', value: 'xiao' },
  { label: 'Bob', value: 'mao' },
]

const typeOptions = [
  { label: 'Private', value: 'private' },
  { label: 'Public', value: 'public' },
]

function scrollToField(fieldKey: string) {
  const labelNode = document.querySelector(`label[for="${fieldKey}"]`)
  if (labelNode) labelNode.scrollIntoView(true)
}

export function FormAdvancedPage() {
  const { token } = theme.useToken()
  const [error, setError] = useState<ErrorField[]>([])

  const getErrorInfo = (errors: ErrorField[]) => {
    const errorCount = errors.filter((item) => item.errors.length > 0).length
    if (errorCount === 0) return null

    const errorList = errors.map((err) => {
      if (!err || err.errors.length === 0) return null
      const key = err.name[0] as FieldLabelKey
      return (
        <li
          key={String(key)}
          style={{
            padding: '8px 16px',
            listStyle: 'none',
            borderBottom: `1px solid ${token.colorSplit}`,
            cursor: 'pointer',
          }}
          onClick={() => scrollToField(String(key))}
        >
          <XCircle style={{ color: token.colorError, marginRight: 4 }} />
          <span>{err.errors[0]}</span>
          <span style={{ marginTop: 2, color: token.colorTextSecondary, fontSize: 12, display: 'block' }}>
            {fieldLabels[key]}
          </span>
        </li>
      )
    })

    return (
      <span style={{ marginRight: 24, color: token.colorError, cursor: 'pointer' }}>
        <Popover
          title="Validation Errors"
          content={<ul style={{ minWidth: 256, maxHeight: 290, padding: 0, margin: 0, overflow: 'auto' }}>{errorList}</ul>}
          trigger="click"
          getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
        >
          <XCircle />
        </Popover>
        {errorCount}
      </span>
    )
  }

  const columns: ProColumnType<TableMember>[] = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: '20%' },
    { title: 'Employee ID', dataIndex: 'workId', key: 'workId', width: '20%' },
    { title: 'Department', dataIndex: 'department', key: 'department', width: '40%' },
    {
      title: 'Action',
      key: 'action',
      valueType: 'option',
      render: (_text, record, _index, action) => [
        <a key="edit" onClick={() => action?.startEditable(record.key)}>
          Edit
        </a>,
      ],
    },
  ]

  const onFinish = (values: Record<string, unknown>): Promise<boolean> => {
    setError([])
    console.log('form values:', values)
    void message.success('Submitted successfully')
    return Promise.resolve(true)
  }

  const onFinishFailed = (errorInfo: { errorFields: ErrorField[] }) => {
    setError(errorInfo.errorFields)
  }

  return (
    <ProForm
      layout="vertical"
      requiredMark={false}
      submitter={{
        render: (_props, dom) => (
          <FooterToolbar>
            {getErrorInfo(error)}
            {dom}
          </FooterToolbar>
        ),
      }}
      initialValues={{ members: tableData }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <PageContainer
        header={{ title: 'Advanced Form', breadcrumb: {} }}
        content="Advanced forms are common in scenarios where large amounts of data need to be entered and submitted at once."
      >
        <Card title="Repository Management" variant="borderless" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.name}
                name="name"
                rules={[{ required: true, message: 'Please enter the repository name' }]}
                placeholder="Enter repository name"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.url}
                name="url"
                rules={[{ required: true, message: 'Please enter the repository domain' }]}
                fieldProps={{
                  style: { width: '100%' },
                  addonBefore: 'http://',
                  addonAfter: '.com',
                }}
                placeholder="Enter domain"
              />
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.owner}
                name="owner"
                rules={[{ required: true, message: 'Please select an admin' }]}
                options={ownerOptions}
                placeholder="Select admin"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.approver}
                name="approver"
                rules={[{ required: true, message: 'Please select an approver' }]}
                options={ownerOptions}
                placeholder="Select approver"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDateRangePicker
                label={fieldLabels.dateRange}
                name="dateRange"
                fieldProps={{ style: { width: '100%' } }}
                rules={[{ required: true, message: 'Please select the effective date' }]}
              />
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.type}
                name="type"
                rules={[{ required: true, message: 'Please select the repository type' }]}
                options={typeOptions}
                placeholder="Select repository type"
              />
            </Col>
          </Row>
        </Card>

        <Card title="Task Management" variant="borderless" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.name2}
                name="name2"
                rules={[{ required: true, message: 'Please enter the task name' }]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.url2}
                name="url2"
                rules={[{ required: true, message: 'Please enter the task description' }]}
              />
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.owner2}
                name="owner2"
                rules={[{ required: true, message: 'Please select an assignee' }]}
                options={ownerOptions}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.approver2}
                name="approver2"
                rules={[{ required: true, message: 'Please select an owner' }]}
                options={ownerOptions}
                placeholder="Select approver"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormTimePicker
                label={fieldLabels.dateRange2}
                name="dateRange2"
                rules={[{ required: true, message: 'Please select a reminder time' }]}
                placeholder="Reminder time"
                fieldProps={{ style: { width: '100%' } }}
              />
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.type2}
                name="type2"
                rules={[{ required: true, message: 'Please select the task type' }]}
                options={typeOptions}
                placeholder="Select task type"
              />
            </Col>
          </Row>
        </Card>

        <Card title="Member Management" variant="borderless">
          <ProForm.Item name="members">
            <EditableProTable<TableMember>
              rowKey="key"
              columns={columns}
              recordCreatorProps={{
                record: () => ({ key: `NEW_${Date.now()}` }),
              }}
            />
          </ProForm.Item>
        </Card>
      </PageContainer>
    </ProForm>
  )
}
