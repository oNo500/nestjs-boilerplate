import { Badge } from '@workspace/ui/components/badge'

interface UserStatusBadgeProps {
  banned: boolean
}

export function UserStatusBadge({ banned }: UserStatusBadgeProps) {
  return banned ? (
    <Badge variant="destructive">Banned</Badge>
  ) : (
    <Badge variant="outline" className="border-green-600 text-green-600">
      Active
    </Badge>
  )
}
