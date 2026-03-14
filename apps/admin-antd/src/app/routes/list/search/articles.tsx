import { PageContainer } from '@ant-design/pro-components'
import { Avatar, Card, Input, List, Select, Space, Tag, Typography } from 'antd'
import { FileText } from 'lucide-react'

import { useArticles } from '@/features/scaffold/api/use-articles'
import { getArticleCategoryEnum, getArticleCategoryOptions } from '@/features/scaffold/utils/article-enums'

import type { Article } from '@/features/scaffold/types'

const { Text, Paragraph } = Typography

const CATEGORY_COLOR_MAP: Record<string, string> = {
  tech: 'blue',
  design: 'cyan',
  product: 'orange',
  other: 'default',
}

export function ListSearchArticlesPage() {
  const { data, isLoading } = useArticles({})

  const categoryEnum = getArticleCategoryEnum()
  const categoryOptions = getArticleCategoryOptions()

  return (
    <PageContainer header={{ title: 'Search List (Articles)', breadcrumb: {} }}>
      <Card variant="borderless" style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Input.Search placeholder="Search article title" style={{ width: 300 }} />
          <Select
            placeholder="Select category"
            style={{ width: 140 }}
            options={[{ label: 'All', value: '' }, ...categoryOptions]}
          />
        </Space>
      </Card>

      <List<Article>
        itemLayout="vertical"
        dataSource={data?.data ?? []}
        rowKey="id"
        loading={isLoading}
        renderItem={(item) => (
          <Card variant="borderless" style={{ marginBottom: 16 }}>
            <List.Item
              key={item.id}
              style={{ padding: 0 }}
              extra={(
                <Space orientation="vertical" align="end">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.updatedAt}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.viewCount.toLocaleString()}
                    {' '}
                    views
                  </Text>
                </Space>
              )}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ background: '#1677ff' }} icon={<FileText size={16} />} />
                }
                title={(
                  <Space>
                    <a href="#">{item.title}</a>
                    <Tag color={CATEGORY_COLOR_MAP[item.category] ?? 'default'}>
                      {categoryEnum[item.category]?.text ?? item.category}
                    </Tag>
                  </Space>
                )}
                description={(
                  <Space>
                    <Text type="secondary">
                      Author:
                      {' '}
                      {item.author}
                    </Text>
                    {item.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                )}
              />
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                {item.content.slice(0, 120)}
              </Paragraph>
            </List.Item>
          </Card>
        )}
      />
    </PageContainer>
  )
}
