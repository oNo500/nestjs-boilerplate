import type { TFunction } from 'i18next'

export function getRoleOptions(t: TFunction<'roles'>) {
  return [
    { label: t('role.user'), value: 'USER' },
    { label: t('role.admin'), value: 'ADMIN' },
  ]
}

export function getRoleLabels(t: TFunction<'roles'>): Record<string, string> {
  return {
    USER: t('role.user'),
    ADMIN: t('role.admin'),
  }
}
