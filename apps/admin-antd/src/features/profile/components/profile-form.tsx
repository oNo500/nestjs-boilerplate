import { ProCard, ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components'
import { Skeleton, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import { useProfile } from '@/features/profile/api/use-profile'
import { useUpdateProfile } from '@/features/profile/api/use-update-profile'

import type { UpdateProfileDto } from '@/features/profile/types'

const { Title } = Typography

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile()
  const updateMutation = useUpdateProfile()
  const { t } = useTranslation('profile')

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
      <Title level={4}>{t('form.basicInfoTitle')}</Title>
      <ProForm
        initialValues={{
          displayName: profile?.displayName ?? '',
          avatarUrl: profile?.avatarUrl ?? '',
          bio: profile?.bio ?? '',
        }}
        onFinish={handleFinish}
        submitter={{
          searchConfig: {
            submitText: t('form.saveChanges'),
          },
          resetButtonProps: false,
        }}
      >
        <ProFormText
          width="md"
          name="displayName"
          label={t('fields.displayName')}
          placeholder={t('form.displayNamePlaceholder')}
          rules={[{ max: 50, message: t('validation.displayNameMax') }]}
        />
        <ProFormText
          width="lg"
          name="avatarUrl"
          label={t('fields.avatarUrl')}
          placeholder={t('form.avatarUrlPlaceholder')}
          rules={[{ type: 'url', message: t('validation.avatarUrlInvalid') }]}
        />
        <ProFormTextArea
          width="lg"
          name="bio"
          label={t('fields.bio')}
          placeholder={t('form.bioPlaceholder')}
          fieldProps={{ rows: 4 }}
          rules={[{ max: 200, message: t('validation.bioMax') }]}
        />
      </ProForm>
    </ProCard>
  )
}
