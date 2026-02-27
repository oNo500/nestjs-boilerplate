import { ProTable } from '@ant-design/pro-components'
import { Button, Popconfirm, Space, Tag } from 'antd'
import { Edit, Eye, Plus, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useCreateArticle, useDeleteArticle, useUpdateArticle } from '@/features/scaffold/api/use-articles'
import { getArticleCategoryEnum, getArticleCategoryOptions, getArticleStatusEnum } from '@/features/scaffold/utils/article-enums'
import { fetchClient } from '@/lib/api'
import { formatDate } from '@/utils/date'

import { ScaffoldForm } from './scaffold-form'

import type { Article, CreateArticleDto, QueryParams, UpdateArticleDto } from '@/features/scaffold/types'
import type { ActionType, ProColumns } from '@ant-design/pro-components'

interface ArticleListResponse {
  data: Article[]
  total: number
  success: boolean
}

async function fetchArticles(params: QueryParams): Promise<ArticleListResponse> {
  const { data } = await fetchClient.GET('/api/articles/paginated', {
    params: {
      query: {
        page: params.current,
        pageSize: params.pageSize,
      },
    },
  })
  const res = data as { data: Article[], total: number }
  return { data: res.data, total: res.total, success: true }
}

// --- Read-only list (with detail navigation) ---

export function ScaffoldListTable() {
  const navigate = useNavigate()
  const actionRef = useRef<ActionType>(null)
  const { t } = useTranslation('scaffold')
  const { t: tCommon } = useTranslation('common')

  const statusEnum = getArticleStatusEnum(t)
  const categoryEnum = getArticleCategoryEnum(t)

  const columns: ProColumns<Article>[] = [
    {
      title: t('fields.title'),
      dataIndex: 'title',
      width: 240,
      ellipsis: true,
    },
    {
      title: t('fields.category'),
      dataIndex: 'category',
      width: 100,
      valueType: 'select',
      valueEnum: categoryEnum,
    },
    {
      title: t('fields.status'),
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: statusEnum,
      render: (_, record) => {
        const colorMap: Record<string, string> = {
          draft: 'default',
          published: 'success',
          archived: 'warning',
        }
        return <Tag color={colorMap[record.status]}>{statusEnum[record.status]?.text}</Tag>
      },
    },
    { title: t('fields.author'), dataIndex: 'author', width: 100, search: false },
    { title: t('fields.viewCount'), dataIndex: 'viewCount', width: 80, search: false },
    {
      title: t('fields.isPinned'),
      dataIndex: 'isPinned',
      width: 70,
      search: false,
      render: (_, record) => (record.isPinned ? <Tag color="blue">{t('fields.isPinned')}</Tag> : '-'),
    },
    {
      title: t('fields.publishedAt'),
      dataIndex: 'publishedAt',
      width: 160,
      search: false,
      render: (_, record) => formatDate(record.publishedAt),
    },
    {
      title: tCommon('actions.view'),
      valueType: 'option',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<Eye size={14} />}
          onClick={() => void navigate(`/list/table/${record.id}`)}
        >
          {tCommon('actions.view')}
        </Button>
      ),
    },
  ]

  return (
    <ProTable<Article>
      columns={columns}
      actionRef={actionRef}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      dateFormatter="string"
      toolBarRender={() => []}
      request={async (params) =>
        fetchArticles({ current: params.current, pageSize: params.pageSize })}
    />
  )
}

// --- CRUD table (self-contained state, zero external props) ---

export function ScaffoldCrudTable() {
  const actionRef = useRef<ActionType>(null)
  const createArticle = useCreateArticle()
  const updateArticle = useUpdateArticle()
  const deleteArticle = useDeleteArticle()
  const { t } = useTranslation('scaffold')
  const { t: tCommon } = useTranslation('common')

  const statusEnum = getArticleStatusEnum(t)
  const categoryEnum = getArticleCategoryEnum(t)
  const categoryOptions = getArticleCategoryOptions(t)

  const columns: ProColumns<Article>[] = [
    {
      title: t('fields.title'),
      dataIndex: 'title',
      width: 240,
      ellipsis: true,
    },
    {
      title: t('fields.category'),
      dataIndex: 'category',
      width: 100,
      valueType: 'select',
      valueEnum: categoryEnum,
    },
    {
      title: t('fields.status'),
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: statusEnum,
      render: (_, record) => {
        const colorMap: Record<string, string> = {
          draft: 'default',
          published: 'success',
          archived: 'warning',
        }
        return <Tag color={colorMap[record.status]}>{statusEnum[record.status]?.text}</Tag>
      },
    },
    { title: t('fields.author'), dataIndex: 'author', width: 100, search: false },
    { title: t('fields.viewCount'), dataIndex: 'viewCount', width: 80, search: false },
    {
      title: t('fields.isPinned'),
      dataIndex: 'isPinned',
      width: 70,
      search: false,
      render: (_, record) => (record.isPinned ? <Tag color="blue">{t('fields.isPinned')}</Tag> : '-'),
    },
    {
      title: t('fields.publishedAt'),
      dataIndex: 'publishedAt',
      width: 160,
      search: false,
      render: (_, record) => formatDate(record.publishedAt),
    },
    {
      title: tCommon('actions.edit'),
      valueType: 'option',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <ScaffoldForm
            mode="edit"
            initialValues={record}
            categoryOptions={categoryOptions}
            trigger={(
              <Button type="link" size="small" icon={<Edit size={14} />}>
                {tCommon('actions.edit')}
              </Button>
            )}
            onFinish={async (values) => {
              await updateArticle.mutateAsync({ id: record.id, body: values as UpdateArticleDto })
              void actionRef.current?.reload()
              return true
            }}
          />
          <Popconfirm
            title={t('actions.confirmDelete')}
            description={t('actions.confirmDeleteDesc', { title: record.title })}
            onConfirm={async () => {
              await deleteArticle.mutateAsync(record.id)
              void actionRef.current?.reload()
            }}
            okText={tCommon('actions.confirm')}
            cancelText={tCommon('actions.cancel')}
          >
            <Button type="link" size="small" danger icon={<Trash2 size={14} />}>
              {tCommon('actions.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <ProTable<Article>
      columns={columns}
      actionRef={actionRef}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      dateFormatter="string"
      toolBarRender={() => [
        <ScaffoldForm
          key="create"
          mode="create"
          categoryOptions={categoryOptions}
          trigger={(
            <Button type="primary" icon={<Plus size={16} />}>
              {t('actions.createArticle')}
            </Button>
          )}
          onFinish={async (values) => {
            await createArticle.mutateAsync(values as CreateArticleDto)
            void actionRef.current?.reload()
            return true
          }}
        />,
      ]}
      request={async (params) =>
        fetchArticles({ current: params.current, pageSize: params.pageSize })}
    />
  )
}

/** @deprecated Use ScaffoldListTable or ScaffoldCrudTable */
export function ScaffoldTable(props: { mode: 'view-only' | 'crud' }) {
  if (props.mode === 'crud') return <ScaffoldCrudTable />
  return <ScaffoldListTable />
}
