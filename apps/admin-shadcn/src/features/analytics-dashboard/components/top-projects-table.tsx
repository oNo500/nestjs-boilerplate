'use client'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { cn } from '@workspace/ui/lib/utils'

import { $api } from '@/lib/api'

const STATUS_PROGRESS: Record<string, number> = {
  published: 100,
  draft: 30,
  archived: 0,
}

const STATUS_COLOR: Record<string, string> = {
  published: '**:data-[slot=progress-indicator]:bg-teal-400',
  draft: '**:data-[slot=progress-indicator]:bg-amber-300',
  archived: '**:data-[slot=progress-indicator]:bg-muted-foreground',
}

const TopProjectsTable = () => {
  const { data: articlesData } = $api.useQuery('get', '/api/articles/paginated', {
    params: { query: { pageSize: 6 } },
  })

  const articles = articlesData?.data ?? []

  return (
    <Card className="w-full h-full pb-0 pt-6 gap-6">
      <CardHeader className="sm:flex items-center justify-between px-6">
        <div>
          <CardTitle className="leading-normal">Recent Articles</CardTitle>
          <CardDescription>
            Latest published and draft articles
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table className="min-w-2xl">
            <TableHeader>
              <TableRow className="hover:bg-transparent!">
                <TableHead className="p-3 ps-6">#</TableHead>
                <TableHead className="p-2">Article</TableHead>
                <TableHead className="p-2">Category</TableHead>
                <TableHead className="p-2">Author</TableHead>
                <TableHead className="p-2">Views</TableHead>
                <TableHead className="p-2 pe-6">Progress</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {articles.map((article, index) => (
                <TableRow key={article.id}>
                  <TableCell className="whitespace-nowrap p-3 ps-6 text-muted-foreground text-sm">
                    {index + 1}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div>
                      <h6 className="text-sm font-medium">{article.title}</h6>
                      <p className="text-xs text-muted-foreground">
                        {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm capitalize text-muted-foreground">{article.category}</span>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <p className="text-sm">{article.author || '—'}</p>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <p className="text-sm text-foreground">{article.viewCount.toLocaleString()}</p>
                  </TableCell>

                  <TableCell className="whitespace-nowrap pe-6">
                    <Progress
                      value={STATUS_PROGRESS[article.status] ?? 0}
                      className={cn(
                        'w-full h-1.5 [&>div]:h-1.5',
                        STATUS_COLOR[article.status],
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default TopProjectsTable
