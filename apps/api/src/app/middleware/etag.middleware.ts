import * as crypto from 'node:crypto'

import { Injectable } from '@nestjs/common'

import type { NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'

/**
 * ETag middleware
 *
 * Spec:
 * - RFC 9110 §8.8.3 (ETag): https://httpwg.org/specs/rfc9110.html#field.etag
 * - RFC 9110 §15.4.5 (304 Not Modified): https://httpwg.org/specs/rfc9110.html#status.304
 *
 * Features:
 * - Generates ETags (MD5 hash) for GET/HEAD responses
 * - Handles conditional requests (If-None-Match)
 * - Returns 304 Not Modified when the resource has not changed
 *
 * ETag format:
 * - Strong ETag: "33a64df551425fcc" (byte-for-byte identical content)
 * - Weak ETag: W/"33a64df551425fcc" (semantically equivalent content; this implementation uses strong ETags)
 *
 * Use cases:
 * - Reducing bandwidth (clients use cached responses)
 * - Preventing concurrent update conflicts (optimistic locking)
 * - Improving performance (304 responses have no body)
 *
 * GitHub strategy:
 * > "Conditional requests that return a 304 do not count against the rate limit quota"
 *
 * @example
 * // First request
 * GET /api/users/123
 * ---
 * HTTP/1.1 200 OK
 * ETag: "33a64df551425fcc"
 * { "id": "usr_123", ... }
 *
 * // Conditional request (cache validation)
 * GET /api/users/123
 * If-None-Match: "33a64df551425fcc"
 * ---
 * HTTP/1.1 304 Not Modified
 * ETag: "33a64df551425fcc"
 */
@Injectable()
export class ETagMiddleware implements NestMiddleware {
  use(request: Request, res: Response, next: NextFunction) {
    // Only process GET and HEAD requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return next()
    }

    // Intercept the original json method
    const originalJson = res.json.bind(res) as (body: unknown) => Response

    // Override the json method
    res.json = ((body: unknown) => {
      return this.handleETag(request, res, body, originalJson)
    }) as typeof res.json

    next()
  }

  /**
   * Handle ETag generation and validation
   */
  private handleETag(
    request: Request,
    res: Response,
    body: unknown,
    originalJson: (body: unknown) => Response,
  ): Response {
    // Safety check: if headers have already been sent, pass through
    if (res.headersSent) {
      return originalJson(body)
    }

    // If the business layer has already set an ETag (e.g. optimistic lock version), reuse it;
    // otherwise generate a content hash
    const existingETag = res.getHeader('ETag') as string | undefined
    const etag = existingETag ?? this.generateETag(body)
    if (!existingETag) {
      res.setHeader('ETag', etag)
    }

    // Set Cache-Control header (adjust as needed)
    if (!res.getHeader('Cache-Control')) {
      res.setHeader('Cache-Control', 'max-age=3600') // 1 hour
    }

    // Check If-None-Match header
    const ifNoneMatch = request.headers['if-none-match']
    if (ifNoneMatch) {
      // Support multiple ETags (comma-separated)
      const etags = new Set(ifNoneMatch.split(',').map((e) => e.trim()))

      // Return 304 if any ETag matches
      if (etags.has(etag) || etags.has('*')) {
        return res.status(304).end()
      }
    }

    // Resource has changed, return normally
    return originalJson(body)
  }

  /**
   * Generate an ETag (MD5 hash)
   *
   * @param data - Response data
   * @returns strong ETag format (quoted)
   */
  private generateETag(data: unknown): string {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex')

    // Strong ETag format: wrapped in double quotes
    return `"${hash}"`
  }
}
