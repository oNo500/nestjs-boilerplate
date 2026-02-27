import { PageContainer } from '@ant-design/pro-components'
import { Button } from 'antd'
import { Edit } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { UserDetail, UserForm } from '@/features/users'
import { useUser } from '@/features/users/api/use-user'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user, refetch } = useUser(id!)
  const { t } = useTranslation('users')

  return (
    <PageContainer
      header={{
        title: t('page.detailTitle'),
        breadcrumb: {
          items: [
            { title: t('page.systemManagement') },
            { title: t('page.userManagement'), href: '/system/users' },
            { title: t('page.detailTitle') },
          ],
        },
        extra: user
          ? [
              <UserForm
                key="edit"
                mode="edit"
                initialValues={user}
                onSuccess={() => void refetch()}
                trigger={(
                  <Button type="primary" icon={<Edit size={14} />}>
                    {t('actions.edit')}
                  </Button>
                )}
              />,
            ]
          : [],
      }}
    >
      <UserDetail id={id!} />
    </PageContainer>
  )
}
