'use client'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { AllListPanel } from '@/features/articles/components/all-list-panel'
import { ArticleFormSheet } from '@/features/articles/components/article-form-sheet'
import { CursorPaginationPanel } from '@/features/articles/components/cursor-pagination-panel'
import { OffsetPaginationPanel } from '@/features/articles/components/offset-pagination-panel'

const TABS = [
  { key: 'offset', label: 'Offset Pagination' },
  { key: 'cursor', label: 'Cursor Pagination' },
  { key: 'all', label: 'No Pagination' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function ArticlesPage() {
  const [active, setActive] = useState<TabKey>('offset')

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-sm text-muted-foreground">
            Pagination strategy comparison — switch tabs to see the difference.
          </p>
        </div>
        <ArticleFormSheet
          trigger={(
            <Button size="sm">
              <PlusIcon className="mr-1 h-4 w-4" />
              New Article
            </Button>
          )}
        />
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              active === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'offset' && <OffsetPaginationPanel />}
      {active === 'cursor' && <CursorPaginationPanel />}
      {active === 'all' && <AllListPanel />}
    </div>
  )
}
