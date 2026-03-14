import { ProTable } from '@ant-design/pro-components'
import { Button, Popconfirm, Space, Tag } from 'antd'
import { Edit, Eye, Plus, Trash2 } from 'lucide-react'
import { useRef } from 'react'
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

  const statusEnum = getArticleStatusEnum()
  const categoryEnum = getArticleCategoryEnum()

  const columns: ProColumns<Article>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      width: 240,
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 100,
      valueType: 'select',
      valueEnum: categoryEnum,
    },
    {
      title: 'Status',
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
    { title: 'Author', dataIndex: 'author', width: 100, search: false },
    { title: 'Views', dataIndex: 'viewCount', width: 80, search: false },
    {
      title: 'Pinned',
      dataIndex: 'isPinned',
      width: 70,
      search: false,
      render: (_, record) => (record.isPinned ? <Tag color="blue">Pinned</Tag> : '-'),
    },
    {
      title: 'Published At',
      dataIndex: 'publishedAt',
      width: 160,
      search: false,
      render: (_, record) => formatDate(record.publishedAt),
    },
    {
      title: 'View',
      valueType: 'option',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<Eye size={14} />}
          onClick={() => void navigate(`/list/table/${record.id}`)}
        >
          View
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

  const statusEnum = getArticleStatusEnum()
  const categoryEnum = getArticleCategoryEnum()
  const categoryOptions = getArticleCategoryOptions()

  const columns: ProColumns<Article>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      width: 240,
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 100,
      valueType: 'select',
      valueEnum: categoryEnum,
    },
    {
      title: 'Status',
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
    { title: 'Author', dataIndex: 'author', width: 100, search: false },
    { title: 'Views', dataIndex: 'viewCount', width: 80, search: false },
    {
      title: 'Pinned',
      dataIndex: 'isPinned',
      width: 70,
      search: false,
      render: (_, record) => (record.isPinned ? <Tag color="blue">Pinned</Tag> : '-'),
    },
    {
      title: 'Published At',
      dataIndex: 'publishedAt',
      width: 160,
      search: false,
      render: (_, record) => formatDate(record.publishedAt),
    },
    {
      title: 'Edit',
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
                Edit
              </Button>
            )}
            onFinish={async (values) => {
              await updateArticle.mutateAsync({ id: record.id, body: values as UpdateArticleDto })
              void actionRef.current?.reload()
              return true
            }}
          />
          <Popconfirm
            title="Confirm Delete"
            description={`Are you sure you want to delete "${record.title}"?`}
            onConfirm={async () => {
              await deleteArticle.mutateAsync(record.id)
              void actionRef.current?.reload()
            }}
            okText="OK"
            cancelText="Cancel"
          >
            <Button type="link" size="small" danger icon={<Trash2 size={14} />}>
              Delete
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
              Create Article
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
