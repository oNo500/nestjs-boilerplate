import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  isDark: boolean
  colorPrimary: string
  borderRadius: number
  compact: boolean
  setIsDark: (isDark: boolean) => void
  setColorPrimary: (color: string) => void
  setBorderRadius: (radius: number) => void
  setCompact: (compact: boolean) => void
}

const DEFAULT_SETTINGS = {
  isDark: false,
  colorPrimary: '#1677FF',
  borderRadius: 6,
  compact: false,
}

/**
 * Theme state store
 *
 * Features:
 * - Manages ConfigProvider theme config (primary color, border radius, compact mode)
 * - Persisted to localStorage
 * - ProLayout layout config is managed by SettingDrawer + useState
 *
 * @example
 * ```tsx
 * const { colorPrimary, setColorPrimary } = useThemeStore()
 * <Button onClick={() => setColorPrimary('#ff0000')}>
 *   Change primary color
 * </Button>
 * ```
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setIsDark: (isDark: boolean) =>
        set({
          isDark,
        }),

      setColorPrimary: (color: string) =>
        set({
          colorPrimary: color,
        }),

      setBorderRadius: (radius: number) =>
        set({
          borderRadius: radius,
        }),

      setCompact: (compact: boolean) =>
        set({
          compact,
        }),
    }),
    {
      name: 'app-theme-settings',
    },
  ),
)
