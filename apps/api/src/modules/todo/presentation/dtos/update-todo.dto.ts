import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import {
  IsBooleanField,
  IsStringField,
  MaxLengthField,
} from '@/shared-kernel/infrastructure/decorators/validators'

export class UpdateTodoDto {
  @ApiPropertyOptional({ example: 'Buy groceries' })
  @IsStringField()
  @IsOptional()
  @MaxLengthField(200)
  title?: string

  @ApiPropertyOptional({ example: 'Milk, eggs, bread' })
  @IsStringField()
  @IsOptional()
  @MaxLengthField(1000)
  description?: string

  @ApiPropertyOptional({ example: true })
  @IsBooleanField()
  @IsOptional()
  isCompleted?: boolean
}
