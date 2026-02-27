import { ModalForm, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('scaffold')

  return (
    <ModalForm
      title={mode === 'create' ? t('form.createTitle') : t('form.editTitle')}
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
        label={t('fields.title')}
        placeholder={t('form.titlePlaceholder')}
        rules={[
          { required: true, message: t('validation.titleRequired') },
          { max: 100, message: t('validation.titleMax') },
        ]}
      />
      <ProFormTextArea
        name="content"
        label={t('fields.content')}
        placeholder={t('form.contentPlaceholder')}
        rules={mode === 'create' ? [{ required: true, message: t('validation.contentRequired') }] : []}
        fieldProps={{ rows: 6 }}
      />
      <ProFormText
        name="author"
        label={t('fields.author')}
        placeholder={t('form.authorPlaceholder')}
        rules={[{ required: true, message: t('validation.authorRequired') }]}
      />
      <ProFormSelect
        name="category"
        label={t('fields.category')}
        placeholder={t('form.categoryPlaceholder')}
        options={categoryOptions}
        rules={[{ required: true, message: t('validation.categoryRequired') }]}
      />
      <ProFormSwitch name="isPinned" label={t('fields.isPinned')} />
    </ModalForm>
  )
}
