/**
 * Audit Detail type convention
 *
 * Usage guide for service layers:
 *
 * 1. Build detail with before/after for state-change operations:
 *    ```ts
 *    detail: buildAuditDetail({ before: oldData, after: newData })
 *    ```
 *
 * 2. Build detail with only after for create operations:
 *    ```ts
 *    detail: buildAuditDetail({ after: createdData })
 *    ```
 *
 * 3. Build detail with only before for delete operations:
 *    ```ts
 *    detail: buildAuditDetail({ before: deletedData })
 *    ```
 *
 * 4. Build detail with meta for additional context:
 *    ```ts
 *    detail: buildAuditDetail({ after: data, meta: { reason: 'admin override' } })
 *    ```
 *
 * Note: The caller is responsible for sanitizing sensitive fields (e.g. password hashes)
 * before passing them to this function.
 */
export interface AuditDetail<T = Record<string, unknown>> {
  before?: T
  after?: T
  meta?: Record<string, unknown>
}

/**
 * Build audit detail object for use with AuditLogger.log({ detail: ... })
 *
 * Strips undefined keys so the resulting record is clean.
 */
export function buildAuditDetail<T>(detail: AuditDetail<T>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (detail.before !== undefined) result.before = detail.before
  if (detail.after !== undefined) result.after = detail.after
  if (detail.meta !== undefined) result.meta = detail.meta
  return result
}
