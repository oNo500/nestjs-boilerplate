import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

import { ROLES } from '@/shared-kernel/domain/value-objects/role.vo'

import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

export class AssignRoleDto {
  @ApiProperty({ enum: Object.values(ROLES), example: 'USER' })
  @IsIn(Object.values(ROLES))
  role!: RoleType
}
