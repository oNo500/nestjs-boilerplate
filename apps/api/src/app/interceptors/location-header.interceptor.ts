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
 * Location header interceptor
 *
 * Spec: RFC 9110 §15.3.2 (201 Created)
 * https://httpwg.org/specs/rfc9110.html#status.201
 *
 * Features:
 * - Automatically adds a Location header to 201 Created responses
 * - The Location header points to the URI of the newly created resource
 * - Automatically constructs the URI from the id field in the response data
 *
 * RFC 9110:
 * > "The origin server SHOULD send a Location header field in the response
 * > containing a URI reference for the primary resource created."
 *
 * Use cases:
 * - Successful POST resource creation (returns 201)
 * - Response data contains an id field
 *
 * @example
 * // Usage in Controller
 * @Post()
 * @HttpCode(HttpStatus.CREATED)
 * async create(@Body() dto: CreateDto) {
 *   return this.service.create(dto);
 *   // Location header added automatically: /api/users/{id}
 * }
 */
@Injectable()
export class LocationHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap((data: unknown) => {
        const httpContext = context.switchToHttp()
        const response = httpContext.getResponse<Response>()
        const request = httpContext.getRequest<Request>()

        // Only process 201 Created responses
        if (response.statusCode !== 201) {
          return
        }

        // Check whether the response data contains an id field
        if (
          !data
          || typeof data !== 'object'
          || !('id' in data)
          || typeof data.id !== 'string'
        ) {
          return
        }

        // Build Location header
        const baseUrl = `${request.protocol}://${request.get('host')}`
        const resourcePath = this.buildResourcePath(request.path, data.id)

        response.setHeader('Location', `${baseUrl}${resourcePath}`)
      }),
    )
  }

  /**
   * Build the resource path
   *
   * @param requestPath - Request path (e.g. /api/users)
   * @param resourceId - Resource ID
   * @returns full resource path (e.g. /api/users/usr_123)
   */
  private buildResourcePath(requestPath: string, resourceId: string): string {
    // Remove trailing slash
    const cleanPath = requestPath.replace(/\/$/, '')

    return `${cleanPath}/${resourceId}`
  }
}
