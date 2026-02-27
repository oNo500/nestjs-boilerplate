import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components'
import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useCreateUser } from '@/features/users/api/use-create-user'
import { useUpdateUser } from '@/features/users/api/use-update-user'

import type { User, CreateUserDto, UpdateUserDto } from '@/features/users/types'
import type { ProFormInstance } from '@ant-design/pro-components'

interface UserFormProperties {
  trigger: React.ReactElement
  mode: 'create' | 'edit'
  initialValues?: User
  onSuccess?: () => void
}

export function UserForm({ trigger, mode, initialValues, onSuccess }: UserFormProperties) {
  const formRef = useRef<ProFormInstance>(null)
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const { t } = useTranslation('users')

  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      formRef.current?.setFieldsValue(initialValues)
    }
  }, [mode, initialValues])

  const handleCreate = async (values: CreateUserDto): Promise<boolean> => {
    try {
      await createMutation.mutateAsync({ body: values })
      onSuccess?.()
      return true
    } catch {
      return false
    }
  }

  const handleUpdate = async (values: UpdateUserDto): Promise<boolean> => {
    if (!initialValues) return false
    try {
      await updateMutation.mutateAsync({
        params: { path: { id: initialValues.id } },
        body: values,
      })
      onSuccess?.()
      return true
    } catch {
      return false
    }
  }

  const handleFinish = async (values: CreateUserDto & UpdateUserDto): Promise<boolean> => {
    if (mode === 'create') {
      return handleCreate({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      })
    }
    return handleUpdate({
      name: values.name,
      banned: values.banned,
    })
  }

  return (
    <ModalForm
      title={mode === 'create' ? t('form.titleCreate') : t('form.titleEdit')}
      trigger={trigger}
      formRef={formRef}
      autoFocusFirstInput
      modalProps={{
        destroyOnHidden: true,
      }}
      submitTimeout={2000}
      onFinish={handleFinish}
    >
      <ProFormText
        width="md"
        name="name"
        label={t('fields.name')}
        placeholder={t('form.namePlaceholder')}
        rules={[
          { min: 2, message: t('validation.nameMin') },
          { max: 50, message: t('validation.nameMax') },
        ]}
      />

      <ProFormText
        width="md"
        name="email"
        label={t('fields.email')}
        placeholder={t('form.emailPlaceholder')}
        rules={[
          { required: true, message: t('validation.emailRequired') },
          { type: 'email', message: t('validation.emailInvalid') },
        ]}
      />

      {mode === 'create' && (
        <ProFormText.Password
          width="md"
          name="password"
          label={t('fields.password')}
          placeholder={t('form.passwordPlaceholder')}
          rules={[
            { required: true, message: t('validation.passwordRequired') },
            { min: 6, message: t('validation.passwordMin') },
          ]}
        />
      )}

      <ProFormSelect
        width="md"
        name="role"
        label={t('fields.role')}
        placeholder={t('form.rolePlaceholder')}
        options={[
          { label: t('role.admin'), value: 'admin' },
          { label: t('role.user'), value: 'user' },
        ]}
        rules={mode === 'create' ? undefined : [{ required: false }]}
      />

      {mode === 'edit' && (
        <ProFormSelect
          width="md"
          name="banned"
          label={t('fields.status')}
          placeholder={t('form.statusPlaceholder')}
          options={[
            { label: t('status.normal'), value: false },
            { label: t('status.banned'), value: true },
          ]}
        />
      )}
    </ModalForm>
  )
}
