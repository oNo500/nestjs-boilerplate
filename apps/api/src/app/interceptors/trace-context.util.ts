/**
 * W3C Trace Context utility functions
 *
 * Specification: https://www.w3.org/TR/trace-context/
 *
 * traceparent header format:
 * 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
 * │  │                                │                │
 * │  └─ trace-id (32 hex chars)        │                └─ trace-flags
 * │                                   └─ parent-id (16 hex chars)
 * └─ version
 */

export interface TraceContext {
  version: string
  traceId: string
  parentId: string
  traceFlags: string
}

/**
 * Parses the W3C Trace Context traceparent header.
 *
 * @param traceparent - The traceparent header value
 * @returns The parsed TraceContext object, or null if parsing fails
 *
 * @example
 * const context = parseTraceparent('00-4bf92f3577b34da6-00f067aa0ba902b7-01');
 * // {
 * //   version: '00',
 * //   traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
 * //   parentId: '00f067aa0ba902b7',
 * //   traceFlags: '01'
 * // }
 */
export function parseTraceparent(traceparent: string): TraceContext | null {
  if (!traceparent || typeof traceparent !== 'string') {
    return null
  }

  const parts = traceparent.split('-')

  if (parts.length !== 4) {
    return null
  }

  const [version, traceId, parentId, traceFlags] = parts

  // Validate format
  if (
    version?.length !== 2
    || traceId?.length !== 32
    || parentId?.length !== 16
    || traceFlags?.length !== 2
  ) {
    return null
  }

  // Validate that all parts are valid hexadecimal
  const hexRegex = /^[0-9a-f]+$/i
  if (
    !hexRegex.test(version)
    || !hexRegex.test(traceId)
    || !hexRegex.test(parentId)
    || !hexRegex.test(traceFlags)
  ) {
    return null
  }

  return {
    version,
    traceId,
    parentId,
    traceFlags,
  }
}

/**
 * Generates a new traceparent header (for downstream calls).
 *
 * @param traceId - The trace ID (unchanged)
 * @param parentId - Optional parent ID; a new span ID is generated when omitted
 * @returns The new traceparent header value
 *
 * @example
 * const traceparent = generateTraceparent('4bf92f3577b34da6a3ce929d0e0e4736');
 * // '00-4bf92f3577b34da6a3ce929d0e0e4736-{newly generated spanId}-01'
 */
export function generateTraceparent(
  traceId: string,
  parentId?: string,
): string {
  const newParentId = parentId ?? generateSpanId()
  return `00-${traceId}-${newParentId}-01`
}

/**
 * Generates a new span ID (16 hex characters).
 *
 * @returns A 16-character hexadecimal string
 */
export function generateSpanId(): string {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('')
}

/**
 * Generates a new trace ID (32 hex characters).
 *
 * @returns A 32-character hexadecimal string
 */
export function generateTraceId(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('')
}

/**
 * Validates whether a traceparent header is valid.
 *
 * @param traceparent - The traceparent header value
 * @returns Whether the value is valid
 */
export function isValidTraceparent(traceparent: string): boolean {
  return parseTraceparent(traceparent) !== null
}
