import { Badge } from '@workspace/ui/components/badge'

import type { ComponentProps } from 'react'

type BadgeVariant = ComponentProps<typeof Badge>['variant']

const STATUS_MAP: Record<string, BadgeVariant> = {
  published: 'default',
  draft: 'secondary',
  archived: 'outline',
}

export function ArticleStatusBadge({ status }: { status: string }) {
  return <Badge variant={STATUS_MAP[status] ?? 'outline'}>{status}</Badge>
}
