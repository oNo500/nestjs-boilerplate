import { ProCard, ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components'
import { Skeleton, Typography } from 'antd'

import { useProfile } from '@/features/profile/api/use-profile'
import { useUpdateProfile } from '@/features/profile/api/use-update-profile'

import type { UpdateProfileDto } from '@/features/profile/types'

const { Title } = Typography

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile()
  const updateMutation = useUpdateProfile()

  const handleFinish = async (values: UpdateProfileDto): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({
        body: {
          displayName: values.displayName,
          avatarUrl: values.avatarUrl,
          bio: values.bio,
        },
      })
      return true
    } catch {
      return false
    }
  }

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 4 }} />
  }

  return (
    <ProCard>
      <Title level={4}>Basic Info</Title>
      <ProForm
        initialValues={{
          displayName: profile?.displayName ?? '',
          avatarUrl: profile?.avatarUrl ?? '',
          bio: profile?.bio ?? '',
        }}
        onFinish={handleFinish}
        submitter={{
          searchConfig: {
            submitText: 'Save Changes',
          },
          resetButtonProps: false,
        }}
      >
        <ProFormText
          width="md"
          name="displayName"
          label="Display Name"
          placeholder="Please enter display name"
          rules={[{ max: 50, message: 'Display name must be at most 50 characters' }]}
        />
        <ProFormText
          width="lg"
          name="avatarUrl"
          label="Avatar URL"
          placeholder="Please enter avatar URL"
          rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
        />
        <ProFormTextArea
          width="lg"
          name="bio"
          label="Bio"
          placeholder="Please enter your bio"
          fieldProps={{ rows: 4 }}
          rules={[{ max: 200, message: 'Bio must be at most 200 characters' }]}
        />
      </ProForm>
    </ProCard>
  )
}
