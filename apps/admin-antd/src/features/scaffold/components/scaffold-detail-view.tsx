import { ProDescriptions } from '@ant-design/pro-components'
import { Button, Space, Tag } from 'antd'
import { Edit } from 'lucide-react'

import { useArticleById, useUpdateArticle } from '@/features/scaffold/api/use-articles'
import { getArticleCategoryEnum, getArticleCategoryOptions, getArticleStatusEnum } from '@/features/scaffold/utils/article-enums'
import { DATETIME_FULL_FORMAT, formatDate } from '@/utils/date'

import { ScaffoldForm } from './scaffold-form'

import type { Article, UpdateArticleDto } from '@/features/scaffold/types'

interface ScaffoldDetailViewProperties {
  id: string
}

export function ScaffoldDetailView({ id }: ScaffoldDetailViewProperties) {
  const { data: article } = useArticleById(id)
  const updateArticle = useUpdateArticle()

  if (!article) {
    return null
  }

  const statusEnum = getArticleStatusEnum()
  const categoryEnum = getArticleCategoryEnum()
  const categoryOptions = getArticleCategoryOptions()

  const handleUpdate = async (values: UpdateArticleDto): Promise<boolean> => {
    await updateArticle.mutateAsync({ id: article.id, body: values })
    return true
  }

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <ScaffoldForm
          mode="edit"
          initialValues={article}
          categoryOptions={categoryOptions}
          trigger={(
            <Button type="primary" icon={<Edit size={14} />}>
              Edit
            </Button>
          )}
          onFinish={handleUpdate}
        />
      </div>

      <ProDescriptions<Article>
        title="Basic Info"
        dataSource={article}
        columns={[
          { title: 'ID', dataIndex: 'id', valueType: 'text' },
          { title: 'Title', dataIndex: 'title', valueType: 'text' },
          { title: 'Author', dataIndex: 'author', valueType: 'text' },
          {
            title: 'Category',
            dataIndex: 'category',
            render: (_, record) => (
              <span>{categoryEnum[record.category]?.text ?? record.category}</span>
            ),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (_, record) => {
              const colorMap: Record<string, string> = {
                draft: 'default',
                published: 'success',
                archived: 'warning',
              }
              return <Tag color={colorMap[record.status]}>{statusEnum[record.status]?.text}</Tag>
            },
          },
          { title: 'Views', dataIndex: 'viewCount', valueType: 'text' },
          {
            title: 'Pinned',
            dataIndex: 'isPinned',
            render: (_, record) => (record.isPinned ? <Tag color="blue">Yes</Tag> : '-'),
          },
        ]}
      />

      <ProDescriptions<Article>
        title="Time Info"
        dataSource={article}
        columns={[
          {
            title: 'Published At',
            dataIndex: 'publishedAt',
            render: (_, record) => formatDate(record.publishedAt, DATETIME_FULL_FORMAT),
          },
          {
            title: 'Created At',
            dataIndex: 'createdAt',
            render: (_, record) => formatDate(record.createdAt, DATETIME_FULL_FORMAT),
          },
          {
            title: 'Updated At',
            dataIndex: 'updatedAt',
            render: (_, record) => formatDate(record.updatedAt, DATETIME_FULL_FORMAT),
          },
        ]}
      />
    </Space>
  )
}
