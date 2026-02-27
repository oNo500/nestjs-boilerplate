import { Dropdown } from 'antd'
import { Languages } from 'lucide-react'

import { useLocaleStore } from '@/stores/use-locale-store'

import type { Language } from '@/config/i18n'
import type { MenuProps } from 'antd'

const LOCALE_OPTIONS: { key: Language, flag: string, label: string }[] = [
  { key: 'zh', flag: '🇨🇳', label: '简体中文' },
  { key: 'en', flag: '🇺🇸', label: 'English' },
]

export function LanguageSwitch() {
  const language = useLocaleStore((state) => state.language)
  const setLanguage = useLocaleStore((state) => state.setLanguage)

  const items: MenuProps['items'] = LOCALE_OPTIONS.map(({ key, flag, label }) => ({
    key,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{flag}</span>
        <span>{label}</span>
      </span>
    ),
    style: key === language ? { fontWeight: 600 } : undefined,
    onClick: () => setLanguage(key),
  }))

  return (
    <Dropdown menu={{ items, selectedKeys: [language] }} placement="bottomRight">
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: 4,
          fontSize: 18,
          cursor: 'pointer',
          color: 'inherit',
        }}
      >
        <Languages size={18} />
      </span>
    </Dropdown>
  )
}
