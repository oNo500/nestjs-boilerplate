export const CACHE_PORT = Symbol('CACHE_PORT')

export interface CachePort {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  reset(): Promise<void>
  wrap<T>(key: string, function_: () => Promise<T>, ttl?: number): Promise<T>
}
