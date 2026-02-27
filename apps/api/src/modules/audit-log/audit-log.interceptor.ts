import { Injectable } from '@nestjs/common'
import { tap } from 'rxjs/operators'

import { AuditLogService } from '@/modules/audit-log/application/services/audit-log.service'

import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import type { Request } from 'express'
import type { Observable } from 'rxjs'

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>()
    const { method, url, params } = req
    const user = req.user as { id: string } | undefined

    if (!MUTATING_METHODS.has(method) || !user) {
      return next.handle()
    }

    return next.handle().pipe(
      tap(() => {
        void this.auditLogService.log({
          action: `${method} ${url}`,
          actorId: user.id,
          resourceId: (params as Record<string, string>)?.id,
        })
      }),
    )
  }
}
