import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import {
  IsBooleanField,
  IsNotEmptyField,
  IsStringField,
  MaxLengthField,
} from '@/shared-kernel/infrastructure/decorators/validators'

export class CreateTodoDto {
  @ApiProperty({ example: 'Buy groceries' })
  @IsStringField()
  @IsNotEmptyField()
  @MaxLengthField(200)
  title: string

  @ApiPropertyOptional({ example: 'Milk, eggs, bread' })
  @IsStringField()
  @IsOptional()
  @MaxLengthField(1000)
  description?: string

  @ApiPropertyOptional({ example: false })
  @IsBooleanField()
  @IsOptional()
  isCompleted?: boolean
}
