/**
 * Cache Port
 *
 * Defines the abstract interface for the cache service
 * The underlying implementation (Redis, Memcached, in-memory, etc.) can be swapped easily
 */
export const CACHE_PORT = Symbol('CACHE_PORT')

/**
 * Cache service interface
 */
export interface CachePort {
  /**
   * Retrieve a cached value
   * @param key cache key
   * @returns cached value or undefined
   */
  get<T>(key: string): Promise<T | undefined>

  /**
   * Set a cached value
   * @param key cache key
   * @param value value to cache
   * @param ttl time-to-live in seconds (optional)
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>

  /**
   * Delete a cached entry
   * @param key cache key
   */
  del(key: string): Promise<void>

  /**
   * Clear all cached entries
   */
  reset(): Promise<void>

  /**
   * Wrap a function's result with caching
   * @param key cache key
   * @param fn function that fetches the data
   * @param ttl time-to-live in seconds (optional)
   * @returns cached value or the result of executing the function
   */
  wrap<T>(key: string, function_: () => Promise<T>, ttl?: number): Promise<T>
}
