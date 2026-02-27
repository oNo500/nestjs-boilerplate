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
import { useTranslation } from 'react-i18next'

import type React from 'react'

const optionalStyle: React.CSSProperties = {
  color: 'var(--ant-color-text-secondary)',
  fontStyle: 'normal',
}

function Optional({ label }: { label: string }) {
  return <em style={optionalStyle}>{label}</em>
}

export function ScaffoldFullForm() {
  const { t } = useTranslation('scaffold')

  function onFinish(values: Record<string, unknown>): Promise<boolean> {
    console.log('form values:', values)
    void message.success(t('fullForm.submitSuccess'))
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
          label={t('fullForm.titleLabel')}
          name="title"
          rules={[{ required: true, message: t('validation.titleRequired') }]}
          placeholder={t('fullForm.titlePlaceholder')}
        />

        <ProFormDateRangePicker
          label={t('fullForm.dateLabel')}
          width="md"
          name="date"
          rules={[{ required: true, message: t('fullForm.dateLabel') }]}
          placeholder={[t('fullForm.dateStartPlaceholder'), t('fullForm.dateEndPlaceholder')]}
        />

        <ProFormTextArea
          label={t('fullForm.goalLabel')}
          width="xl"
          name="goal"
          rules={[{ required: true, message: t('fullForm.goalLabel') }]}
          placeholder={t('fullForm.goalPlaceholder')}
        />

        <ProFormTextArea
          label={t('fullForm.standardLabel')}
          name="standard"
          width="xl"
          rules={[{ required: true, message: t('fullForm.standardLabel') }]}
          placeholder={t('fullForm.standardPlaceholder')}
        />

        <ProFormText
          width="md"
          label={(
            <span>
              {t('fullForm.clientLabel')}
              <Optional label={t('fullForm.optional')} />
            </span>
          )}
          tooltip={t('fullForm.clientTooltip')}
          name="client"
          placeholder={t('fullForm.clientPlaceholder')}
        />

        <ProFormText
          width="md"
          label={(
            <span>
              {t('fullForm.invitesLabel')}
              <Optional label={t('fullForm.optional')} />
            </span>
          )}
          name="invites"
          placeholder={t('fullForm.invitesPlaceholder')}
        />

        <ProFormDigit
          label={(
            <span>
              {t('fullForm.weightLabel')}
              <Optional label={t('fullForm.optional')} />
            </span>
          )}
          name="weight"
          placeholder={t('fullForm.weightPlaceholder')}
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
          label={t('fullForm.publicTypeLabel')}
          help={t('fullForm.publicTypeHelp')}
          options={[
            { value: '1', label: t('fullForm.publicTypePublic') },
            { value: '2', label: t('fullForm.publicTypePartial') },
            { value: '3', label: t('fullForm.publicTypePrivate') },
          ]}
        />

        <ProFormDependency name={['publicType']}>
          {({ publicType }) =>
            publicType === '2'
              ? (
                  <ProFormSelect
                    width="md"
                    label={t('fullForm.publicUsersLabel')}
                    name="publicUsers"
                    options={[
                      { value: '1', label: t('fullForm.colleague1') },
                      { value: '2', label: t('fullForm.colleague2') },
                      { value: '3', label: t('fullForm.colleague3') },
                    ]}
                  />
                )
              : null}
        </ProFormDependency>
      </ProForm>
    </Card>
  )
}
