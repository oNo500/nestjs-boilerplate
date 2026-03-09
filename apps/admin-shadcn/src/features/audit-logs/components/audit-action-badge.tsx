import { Badge } from '@workspace/ui/components/badge'

import type { ComponentProps } from 'react'

type BadgeVariant = ComponentProps<typeof Badge>['variant']

function getActionVariant(action: string): BadgeVariant {
  if (action.includes('delete') || action.includes('ban')) return 'destructive'
  if (action.startsWith('auth.')) return 'secondary'
  return 'outline'
}

interface AuditActionBadgeProps {
  action: string
}

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  return <Badge variant={getActionVariant(action)}>{action}</Badge>
}
