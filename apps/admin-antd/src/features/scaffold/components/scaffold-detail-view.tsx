import { ProDescriptions } from '@ant-design/pro-components'
import { Button, Space, Tag } from 'antd'
import { Edit } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('scaffold')
  const { t: tCommon } = useTranslation('common')

  if (!article) {
    return null
  }

  const statusEnum = getArticleStatusEnum(t)
  const categoryEnum = getArticleCategoryEnum(t)
  const categoryOptions = getArticleCategoryOptions(t)

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
              {tCommon('actions.edit')}
            </Button>
          )}
          onFinish={handleUpdate}
        />
      </div>

      <ProDescriptions<Article>
        title={t('sections.basicInfo')}
        dataSource={article}
        columns={[
          { title: t('fields.id'), dataIndex: 'id', valueType: 'text' },
          { title: t('fields.title'), dataIndex: 'title', valueType: 'text' },
          { title: t('fields.author'), dataIndex: 'author', valueType: 'text' },
          {
            title: t('fields.category'),
            dataIndex: 'category',
            render: (_, record) => (
              <span>{categoryEnum[record.category]?.text ?? record.category}</span>
            ),
          },
          {
            title: t('fields.status'),
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
          { title: t('fields.viewCount'), dataIndex: 'viewCount', valueType: 'text' },
          {
            title: t('fields.isPinned'),
            dataIndex: 'isPinned',
            render: (_, record) => (record.isPinned ? <Tag color="blue">{tCommon('actions.confirm')}</Tag> : '-'),
          },
        ]}
      />

      <ProDescriptions<Article>
        title={t('sections.timeInfo')}
        dataSource={article}
        columns={[
          {
            title: t('fields.publishedAt'),
            dataIndex: 'publishedAt',
            render: (_, record) => formatDate(record.publishedAt, DATETIME_FULL_FORMAT),
          },
          {
            title: t('fields.createdAt'),
            dataIndex: 'createdAt',
            render: (_, record) => formatDate(record.createdAt, DATETIME_FULL_FORMAT),
          },
          {
            title: t('fields.updatedAt'),
            dataIndex: 'updatedAt',
            render: (_, record) => formatDate(record.updatedAt, DATETIME_FULL_FORMAT),
          },
        ]}
      />
    </Space>
  )
}
