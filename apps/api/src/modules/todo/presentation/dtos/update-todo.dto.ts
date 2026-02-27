import { IsOptional } from 'class-validator'

import {
  IsBooleanField,
  IsStringField,
  MaxLengthField,
} from '@/shared-kernel/infrastructure/decorators/validators'

export class UpdateTodoDto {
  @IsStringField()
  @IsOptional()
  @MaxLengthField(200)
  title?: string

  @IsStringField()
  @IsOptional()
  @MaxLengthField(1000)
  description?: string

  @IsBooleanField()
  @IsOptional()
  isCompleted?: boolean
}
