export function getRoleOptions() {
  return [
    { label: 'User', value: 'USER' },
    { label: 'Administrator', value: 'ADMIN' },
  ]
}

export function getRoleLabels(): Record<string, string> {
  return {
    USER: 'User',
    ADMIN: 'Administrator',
  }
}
