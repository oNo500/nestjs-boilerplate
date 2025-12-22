import { describe, expect, it } from 'vitest'

import { queryConfig } from '../react-query'

describe('queryConfig', () => {
  it('should have correct default query options', () => {
    expect(queryConfig.queries).toBeDefined()
    expect(queryConfig.queries?.refetchOnWindowFocus).toBe(false)
    expect(queryConfig.queries?.retry).toBe(false)
    expect(queryConfig.queries?.staleTime).toBe(60_000) // 1 minute
  })
})
