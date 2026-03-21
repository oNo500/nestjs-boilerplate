export const SESSION_CLEANUP_PORT = Symbol('SESSION_CLEANUP_PORT')

export interface SessionCleanupPort {
  deleteExpired(): Promise<number>
}
