import { IsOptional, IsString } from 'class-validator'

import { OffsetPaginationDto } from '@/shared-kernel/infrastructure/dtos/offset-pagination.dto'

export class AuditLogQueryDto extends OffsetPaginationDto {
  /**
   * Filter by actor ID
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsOptional()
  @IsString()
  actorId?: string

  /**
   * Filter by action type
   * @example "auth.login"
   */
  @IsOptional()
  @IsString()
  action?: string
}
