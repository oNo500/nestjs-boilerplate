import * as crypto from 'node:crypto'

import { Injectable } from '@nestjs/common'

import type { NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'

/**
 * ETag middleware (RFC 9110 §8.8.3)
 * - Generates strong ETag (MD5 hash) for GET/HEAD responses
 * - Handles If-None-Match conditional requests
 * - Returns 304 Not Modified when resource unchanged
 */
@Injectable()
export class ETagMiddleware implements NestMiddleware {
  use(request: Request, res: Response, next: NextFunction) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return next()
    }

    const originalJson = res.json.bind(res) as (body: unknown) => Response

    res.json = ((body: unknown) => {
      return this.handleETag(request, res, body, originalJson)
    }) as typeof res.json

    next()
  }

  /**
   * Generate and validate ETag
   */
  private handleETag(
    request: Request,
    res: Response,
    body: unknown,
    originalJson: (body: unknown) => Response,
  ): Response {
    if (res.headersSent) {
      return originalJson(body)
    }

    const etag = this.generateETag(body)
    res.setHeader('ETag', etag)

    if (!res.getHeader('Cache-Control')) {
      res.setHeader('Cache-Control', 'max-age=3600') // 1 hour
    }

    const ifNoneMatch = request.headers['if-none-match']
    if (ifNoneMatch) {
      const etags = new Set(ifNoneMatch.split(',').map((e) => e.trim()))

      if (etags.has(etag) || etags.has('*')) {
        return res.status(304).end()
      }
    }

    return originalJson(body)
  }

  /**
   * Generate strong ETag (MD5 hash)
   */
  private generateETag(data: unknown): string {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex')

    return `"${hash}"`
  }
}
