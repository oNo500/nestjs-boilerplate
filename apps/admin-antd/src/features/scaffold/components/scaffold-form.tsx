import { ModalForm, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components'
import { useRef } from 'react'

import type { Article, CreateArticleDto, UpdateArticleDto } from '@/features/scaffold/types'
import type { ProFormInstance } from '@ant-design/pro-components'

interface ScaffoldFormProperties {
  trigger: React.ReactElement
  mode: 'create' | 'edit'
  initialValues?: Article
  categoryOptions: { label: string, value: string }[]
  onFinish: (values: CreateArticleDto | UpdateArticleDto) => Promise<boolean>
}

export function ScaffoldForm({ trigger, mode, initialValues, categoryOptions, onFinish }: ScaffoldFormProperties) {
  const formRef = useRef<ProFormInstance>(null)

  return (
    <ModalForm
      title={mode === 'create' ? 'Create Article' : 'Edit Article'}
      trigger={trigger}
      formRef={formRef}
      autoFocusFirstInput
      modalProps={{ destroyOnClose: true }}
      submitTimeout={2000}
      onOpenChange={(open) => {
        if (open && mode === 'edit' && initialValues) {
          formRef.current?.setFieldsValue(initialValues)
        }
      }}
      onFinish={onFinish}
    >
      <ProFormText
        name="title"
        label="Title"
        placeholder="Enter article title"
        rules={[
          { required: true, message: 'Please enter a title' },
          { max: 100, message: 'Title must be at most 100 characters' },
        ]}
      />
      <ProFormTextArea
        name="content"
        label="Content"
        placeholder="Enter article content"
        rules={mode === 'create' ? [{ required: true, message: 'Please enter content' }] : []}
        fieldProps={{ rows: 6 }}
      />
      <ProFormText
        name="author"
        label="Author"
        placeholder="Enter author name"
        rules={[{ required: true, message: 'Please enter author name' }]}
      />
      <ProFormSelect
        name="category"
        label="Category"
        placeholder="Select category"
        options={categoryOptions}
        rules={[{ required: true, message: 'Please select a category' }]}
      />
      <ProFormSwitch name="isPinned" label="Pinned" />
    </ModalForm>
  )
}
