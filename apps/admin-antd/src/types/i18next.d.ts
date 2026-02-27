import { defaultNS, resources } from '@/config/i18n'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)['zh']
  }
}
