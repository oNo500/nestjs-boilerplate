import {
  ProForm,
  ProFormDateRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'
import { Card, message } from 'antd'

import type React from 'react'

const optionalStyle: React.CSSProperties = {
  color: 'var(--ant-color-text-secondary)',
  fontStyle: 'normal',
}

function Optional({ label }: { label: string }) {
  return <em style={optionalStyle}>{label}</em>
}

export function ScaffoldFullForm() {
  function onFinish(values: Record<string, unknown>): Promise<boolean> {
    console.log('form values:', values)
    void message.success('Submitted successfully')
    return Promise.resolve(true)
  }

  return (
    <Card variant="borderless">
      <ProForm
        requiredMark={false}
        style={{ margin: 'auto', marginTop: 8, maxWidth: 600 }}
        name="basic"
        layout="vertical"
        initialValues={{ publicType: '1' }}
        onFinish={onFinish}
      >
        <ProFormText
          width="md"
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter a title' }]}
          placeholder="Give your goal a name"
        />

        <ProFormDateRangePicker
          label="Date Range"
          width="md"
          name="date"
          rules={[{ required: true, message: 'Date Range' }]}
          placeholder={['Start date', 'End date']}
        />

        <ProFormTextArea
          label="Goal Description"
          width="xl"
          name="goal"
          rules={[{ required: true, message: 'Goal Description' }]}
          placeholder="Enter your phased work goal"
        />

        <ProFormTextArea
          label="Success Criteria"
          name="standard"
          width="xl"
          rules={[{ required: true, message: 'Success Criteria' }]}
          placeholder="Enter success criteria"
        />

        <ProFormText
          width="md"
          label={(
            <span>
              Client
              <Optional label="(Optional)" />
            </span>
          )}
          tooltip="Who this goal serves"
          name="client"
          placeholder="Describe your clients, internal clients @name/ID"
        />

        <ProFormText
          width="md"
          label={(
            <span>
              Reviewers
              <Optional label="(Optional)" />
            </span>
          )}
          name="invites"
          placeholder="@ name/ID, up to 5 reviewers"
        />

        <ProFormDigit
          label={(
            <span>
              Weight
              <Optional label="(Optional)" />
            </span>
          )}
          name="weight"
          placeholder="Enter value"
          min={0}
          max={100}
          width="xs"
          fieldProps={{
            formatter: (value) => `${value ?? 0}%`,
            parser: (value) => Number(value ? value.replace('%', '') : '0'),
          }}
        />

        <ProFormRadio.Group
          name="publicType"
          label="Visibility"
          help="Clients and reviewers are shared by default"
          options={[
            { value: '1', label: 'Public' },
            { value: '2', label: 'Partial' },
            { value: '3', label: 'Private' },
          ]}
        />

        <ProFormDependency name={['publicType']}>
          {({ publicType }) =>
            publicType === '2'
              ? (
                  <ProFormSelect
                    width="md"
                    label="Visible To"
                    name="publicUsers"
                    options={[
                      { value: '1', label: 'Colleague A' },
                      { value: '2', label: 'Colleague B' },
                      { value: '3', label: 'Colleague C' },
                    ]}
                  />
                )
              : null}
        </ProFormDependency>
      </ProForm>
    </Card>
  )
}
