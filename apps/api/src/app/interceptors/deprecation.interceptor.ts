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
 * API deprecation interceptor (RFC 8594, RFC 9110)
 * Adds Deprecation, Sunset, Link, and Warning headers for deprecated versions
 */
@Injectable()
export class DeprecationInterceptor implements NestInterceptor {
  /**
   * Deprecated version mapping
   */
  private readonly deprecatedVersions = new Map<string, DeprecationInfo>([
    // Example: 2024-06-01 deprecation info
  ])

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap(() => {
        const httpContext = context.switchToHttp()
        const request = httpContext.getRequest<Request>()
        const response = httpContext.getResponse<Response>()

        const apiVersion = (request as Request & { apiVersion?: string })
          .apiVersion

        if (!apiVersion) {
          return
        }

        const deprecationInfo = this.deprecatedVersions.get(apiVersion)
        if (!deprecationInfo) {
          return
        }

        // Add Deprecation header (RFC 9110)
        response.setHeader(
          'Deprecation',
          deprecationInfo.deprecatedAt.toUTCString(),
        )

        // Add Sunset header (RFC 8594) when approaching sunset date
        const now = new Date()
        const sixMonthsBeforeSunset = new Date(
          deprecationInfo.sunsetAt.getTime() - 6 * 30 * 24 * 60 * 60 * 1000,
        )

        if (now >= sixMonthsBeforeSunset) {
          response.setHeader('Sunset', deprecationInfo.sunsetAt.toUTCString())
        }

        // Add Link header pointing to migration guide
        const linkRel = now >= sixMonthsBeforeSunset ? 'sunset' : 'deprecation'
        response.setHeader(
          'Link',
          `<${deprecationInfo.migrationGuide}>; rel="${linkRel}"`,
        )

        // Add Warning header (RFC 9110 §5.5)
        const warningMessage
          = now >= sixMonthsBeforeSunset
            ? `API version ${apiVersion} will sunset on ${deprecationInfo.sunsetAt.toISOString().split('T')[0]}`
            : `API version ${apiVersion} is deprecated`

        response.setHeader('Warning', `299 - "${warningMessage}"`)
      }),
    )
  }
}

/**
 * Deprecation info interface
 */
interface DeprecationInfo {
  deprecatedAt: Date
  sunsetAt: Date
  migrationGuide: string
}
