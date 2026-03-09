import { Badge } from '@workspace/ui/components/badge'

interface LoginStatusBadgeProps {
  status: 'success' | 'failed'
}

export function LoginStatusBadge({ status }: LoginStatusBadgeProps) {
  return status === 'success'
    ? <Badge variant="outline" className="text-green-600 border-green-600">Success</Badge>
    : <Badge variant="destructive">Failed</Badge>
}
