import { format } from 'date-fns'

export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm'
export const DATETIME_FULL_FORMAT = 'yyyy-MM-dd HH:mm:ss'

export function formatDate(value: string | null | undefined, fmt = DATETIME_FORMAT): string {
  if (!value) return '-'
  return format(new Date(value), fmt)
}
