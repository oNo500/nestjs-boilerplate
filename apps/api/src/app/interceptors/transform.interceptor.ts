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
 * - Single resource → return directly, no envelope
 * - Collection with object: 'list' → return directly
 * - @UseEnvelope() decorator → keep original data
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

  /**
   * Check if response is a list response
   */
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
