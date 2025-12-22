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
 * Location header interceptor (RFC 9110 §15.3.2)
 * Adds Location header to 201 Created responses
 */
@Injectable()
export class LocationHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap((data: unknown) => {
        const httpContext = context.switchToHttp()
        const response = httpContext.getResponse<Response>()
        const request = httpContext.getRequest<Request>()

        // Only handle 201 Created responses
        if (response.statusCode !== 201) {
          return
        }

        // Check if response has id field
        if (
          !data
          || typeof data !== 'object'
          || !('id' in data)
          || typeof data.id !== 'string'
        ) {
          return
        }

        const baseUrl = `${request.protocol}://${request.get('host')}`
        const resourcePath = this.buildResourcePath(request.path, data.id)

        response.setHeader('Location', `${baseUrl}${resourcePath}`)
      }),
    )
  }

  /**
   * Build resource path
   */
  private buildResourcePath(requestPath: string, resourceId: string): string {
    const cleanPath = requestPath.replace(/\/$/, '')
    return `${cleanPath}/${resourceId}`
  }
}
