import {
  Injectable,
} from '@nestjs/common'
import { map } from 'rxjs/operators'

import { USE_ENVELOPE_KEY } from '@/shared-kernel/infrastructure/decorators/use-envelope.decorator'

import type {
  NestInterceptor,
  ExecutionContext,
  CallHandler } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
import type { Observable } from 'rxjs'

/**
 * Response transform interceptor (conditional envelope)
 *
 * Design reference:
 * - Google API Design Guide: return single resources directly, use a lightweight envelope for collections
 * - https://cloud.google.com/apis/design/design_patterns
 *
 * Behavior rules:
 * 1. Single resource (object) → return directly, no envelope
 * 2. Collection resource (already has object: 'list') → return directly
 * 3. With @UseEnvelope() decorator → keep original data
 * 4. All other cases → return directly
 *
 * @example
 * // Single resource - return directly
 * @Get(':id')
 * async getUser() {
 *   return { id: 'usr_123', email: '...' };
 *   // Response: { "id": "usr_123", "email": "..." }
 * }
 *
 * @example
 * // Collection resource - use decorator
 * @Get()
 * @UseEnvelope()
 * async getUsers() {
 *   return { object: 'list', data: [...], hasMore: true };
 *   // Response: { "object": "list", "data": [...], "hasMore": true }
 * }
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (data === null || data === undefined) {
          return data
        }

        const useEnvelope = this.reflector.get<boolean>(
          USE_ENVELOPE_KEY,
          context.getHandler(),
        )

        if (useEnvelope) {
          return data
        }

        if (this.isListResponse(data)) {
          return data
        }

        return data
      }),
    )
  }

  private isListResponse(data: unknown): boolean {
    return (
      typeof data === 'object'
      && data !== null
      && 'object' in data
      && data.object === 'list'
      && 'data' in data
      && Array.isArray(data.data)
    )
  }
}
