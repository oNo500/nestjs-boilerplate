import {
  Injectable,
} from '@nestjs/common'
import { tap } from 'rxjs/operators'

import type {
  NestInterceptor,
  ExecutionContext,
  CallHandler } from '@nestjs/common'
import type { Response, Request } from 'express'
import type { Observable } from 'rxjs'

/**
 * Link header interceptor
 *
 * Spec: RFC 8288 (Web Linking)
 * https://www.rfc-editor.org/rfc/rfc8288.html
 *
 * Features:
 * - Automatically adds Link headers to paginated responses
 * - Supports first, prev, self, next, last relation types
 * - Compliant with RFC 8288 format
 *
 * RFC 8288 format:
 * Link: &lt;https://example.com/page/2>; rel="next",
 *       &lt;https://example.com/page/1>; rel="prev"
 *
 * Use cases:
 * - Cursor-based pagination
 * - Offset-based pagination
 * - Pagination navigation for any collection resource
 *
 * @example
 * // Response example
 * HTTP/1.1 200 OK
 * Link: <https://api.example.com/users?cursor=next_xyz>; rel="next",
 *       <https://api.example.com/users?cursor=prev_abc>; rel="prev",
 *       <https://api.example.com/users>; rel="self"
 * X-Total-Count: 156
 */
@Injectable()
export class LinkHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap((data: unknown) => {
        // Only process collection responses
        if (!this.isListResponse(data)) {
          return
        }

        const httpContext = context.switchToHttp()
        const response = httpContext.getResponse<Response>()
        const request = httpContext.getRequest<Request>()

        // Build Link header
        const links = this.buildLinks(request, data)
        if (links.length > 0) {
          response.setHeader('Link', links.join(', '))
        }

        // Add total count header (offset pagination flat format)
        if (this.isOffsetListResponse(data)) {
          response.setHeader('X-Total-Count', String(data.total))
          // Calculate total pages
          const totalPages = Math.ceil(data.total / data.pageSize)
          response.setHeader('X-Page-Count', String(totalPages))
        }
      }),
    )
  }

  /**
   * Check whether the response is a collection response
   *
   * A collection response should contain:
   * - object: 'list'
   * - data: array
   */
  private isListResponse(data: unknown): data is Record<string, unknown> {
    return (
      typeof data === 'object'
      && data !== null
      && 'object' in data
      && data.object === 'list'
      && 'data' in data
      && Array.isArray(data.data)
    )
  }

  /**
   * Check whether the response is an offset pagination response (flat format)
   */
  private isOffsetListResponse(
    data: unknown,
  ): data is { total: number, page: number, pageSize: number, hasMore: boolean } {
    return (
      typeof data === 'object'
      && data !== null
      && 'total' in data
      && 'page' in data
      && 'pageSize' in data
      && typeof (data as Record<string, unknown>).total === 'number'
    )
  }

  /**
   * Build the RFC 8288 Link header array
   *
   * @param request - Express request object
   * @param data - Response data
   * @returns array of Link header strings
   */
  private buildLinks(
    request: Request,
    data: Record<string, unknown>,
  ): string[] {
    const baseUrl = `${request.protocol}://${request.get('host')}${request.path}`
    const links: string[] = []

    // Cursor pagination
    if ('nextCursor' in data) {
      // Next page
      if (
        'hasMore' in data
        && data.hasMore
        && 'nextCursor' in data
        && data.nextCursor
        && typeof data.nextCursor === 'string'
      ) {
        const nextUrl = this.buildUrl(baseUrl, request.query, {
          cursor: data.nextCursor,
        })
        links.push(`<${nextUrl}>; rel="next"`)
      }

      // Current page
      const selfUrl = this.buildUrl(baseUrl, request.query)
      links.push(`<${selfUrl}>; rel="self"`)

      return links
    }

    // Offset pagination (flat format)
    if (this.isOffsetListResponse(data)) {
      const page = data.page
      const pageSize = data.pageSize
      const total = data.total
      const totalPages = Math.ceil(total / pageSize)
      const hasPrevious = page > 1
      const hasNext = data.hasMore

      // First page
      if (page > 1) {
        const firstUrl = this.buildUrl(baseUrl, request.query, {
          page: 1,
          pageSize,
        })
        links.push(`<${firstUrl}>; rel="first"`)
      }

      // Previous page
      if (hasPrevious) {
        const previousUrl = this.buildUrl(baseUrl, request.query, {
          page: page - 1,
          pageSize,
        })
        links.push(`<${previousUrl}>; rel="prev"`)
      }

      // Current page
      const selfUrl = this.buildUrl(baseUrl, request.query)
      links.push(`<${selfUrl}>; rel="self"`)

      // Next page
      if (hasNext) {
        const nextUrl = this.buildUrl(baseUrl, request.query, {
          page: page + 1,
          pageSize,
        })
        links.push(`<${nextUrl}>; rel="next"`)
      }

      // Last page
      if (page < totalPages) {
        const lastUrl = this.buildUrl(baseUrl, request.query, {
          page: totalPages,
          pageSize,
        })
        links.push(`<${lastUrl}>; rel="last"`)
      }
    }

    return links
  }

  /**
   * Build a URL
   *
   * @param baseUrl - Base URL
   * @param query - Current query parameters
   * @param overrides - Query parameters to override
   * @returns full URL string
   */
  private buildUrl(
    baseUrl: string,
    query: Record<string, unknown>,
    overrides: Record<string, string | number> = {},
  ): string {
    const parameters = new URLSearchParams()

    // Add existing query parameters
    for (const [key, value] of Object.entries(query)) {
      if (key !== 'cursor' && key !== 'page') {
        parameters.set(key, String(value))
      }
    }

    // Override specified parameters
    for (const [key, value] of Object.entries(overrides)) {
      parameters.set(key, String(value))
    }

    const queryString = parameters.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }
}
