import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { i18next } from '@/config/i18n'

import type { Language } from '@/config/i18n'

interface LocaleStore {
  language: Language
  setLanguage: (lang: Language) => void
}

function onAfterRehydrate(state: LocaleStore | undefined) {
  if (state) void i18next.changeLanguage(state.language)
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => {
        void i18next.changeLanguage(lang)
        set({ language: lang })
      },
    }),
    {
      name: 'app-locale',
      onRehydrateStorage: () => onAfterRehydrate,
    },
  ),
)
