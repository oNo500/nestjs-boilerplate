import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components'
import { useRef, useEffect } from 'react'

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
      title={mode === 'create' ? 'Create User' : 'Edit User'}
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
        label="Username"
        placeholder="Please enter username"
        rules={[
          { min: 2, message: 'Username must be at least 2 characters' },
          { max: 50, message: 'Username must be at most 50 characters' },
        ]}
      />

      <ProFormText
        width="md"
        name="email"
        label="Email"
        placeholder="Please enter email"
        rules={[
          { required: true, message: 'Please enter email' },
          { type: 'email', message: 'Please enter a valid email address' },
        ]}
      />

      {mode === 'create' && (
        <ProFormText.Password
          width="md"
          name="password"
          label="Password"
          placeholder="Please enter password"
          rules={[
            { required: true, message: 'Please enter password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        />
      )}

      <ProFormSelect
        width="md"
        name="role"
        label="Role"
        placeholder="Please select role"
        options={[
          { label: 'Administrator', value: 'ADMIN' },
          { label: 'User', value: 'USER' },
        ]}
        rules={mode === 'create' ? undefined : [{ required: false }]}
      />

      {mode === 'edit' && (
        <ProFormSelect
          width="md"
          name="banned"
          label="Status"
          placeholder="Please select status"
          options={[
            { label: 'Normal', value: false },
            { label: 'Banned', value: true },
          ]}
        />
      )}
    </ModalForm>
  )
}
