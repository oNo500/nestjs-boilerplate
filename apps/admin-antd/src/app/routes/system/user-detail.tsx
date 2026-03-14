import { PageContainer } from '@ant-design/pro-components'
import { Button } from 'antd'
import { Edit } from 'lucide-react'
import { useParams } from 'react-router'

import { UserDetail, UserForm } from '@/features/users'
import { useUser } from '@/features/users/api/use-user'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user, refetch } = useUser(id!)

  return (
    <PageContainer
      header={{
        title: 'User Detail',
        breadcrumb: {
          items: [
            { title: 'System' },
            { title: 'Users', href: '/system/users' },
            { title: 'User Detail' },
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
                    Edit
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
