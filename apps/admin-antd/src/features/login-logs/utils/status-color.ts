export function getStatusColor(status: 'success' | 'failed'): string {
  return status === 'success' ? 'green' : 'red'
}
