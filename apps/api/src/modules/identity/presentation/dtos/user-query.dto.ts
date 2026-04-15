import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

import { ROLES } from '@/shared-kernel/domain/value-objects/role.vo'
import { IsInField } from '@/shared-kernel/infrastructure/decorators/validators'
import { OffsetPaginationDto } from '@/shared-kernel/infrastructure/dtos/offset-pagination.dto'

import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

/**
 * User query DTO
 *
 * Extends offset pagination parameters
 *
 * Adapted to better-auth schema:
 * - search matches name and email
 * - role filter uses a string value
 * - banned filter uses a boolean value
 */
export class UserQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ example: 'ADMIN', enum: Object.values(ROLES) })
  @IsOptional()
  @IsInField(Object.values(ROLES))
  role?: RoleType

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value as boolean | undefined
  })
  banned?: boolean
}
