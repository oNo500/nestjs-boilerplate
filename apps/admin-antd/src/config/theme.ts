import { theme as antdTheme } from 'antd'

import type { MappingAlgorithm, ThemeConfig } from 'antd'

interface ThemeSettings {
  isDark: boolean
  colorPrimary: string
  borderRadius: number
  compact: boolean
}

/**
 * Generate Ant Design theme configuration
 *
 * @param settings - Theme settings
 * @returns Ant Design ThemeConfig
 */
export const generateThemeConfig = (settings: ThemeSettings): ThemeConfig => {
  const { isDark, colorPrimary, borderRadius, compact } = settings

  // Merged algorithms: supports stacking multiple algorithms (based on ProComponents implementation)
  const algorithms = [
    compact ? antdTheme.compactAlgorithm : antdTheme.defaultAlgorithm,
    isDark ? antdTheme.darkAlgorithm : undefined,
  ].filter(Boolean) as MappingAlgorithm[]

  return {
    hashed: false, // Disable unique theme hash to reduce bundle size (ensures single-project context to avoid isolation issues)
    algorithm: algorithms,
    token: {
      colorPrimary,
      borderRadius,
    },
  }
}
