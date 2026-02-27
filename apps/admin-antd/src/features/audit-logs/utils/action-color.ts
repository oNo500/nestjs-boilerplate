export function getActionColor(action: string): string {
  if (action === 'auth.login') return 'default'
  if (action.startsWith('POST')) return 'success'
  if (action.startsWith('PATCH') || action.startsWith('PUT')) return 'processing'
  if (action.startsWith('DELETE')) return 'error'
  return 'default'
}
