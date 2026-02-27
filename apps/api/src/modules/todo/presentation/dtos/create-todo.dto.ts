import { IsOptional } from 'class-validator'

import {
  IsBooleanField,
  IsNotEmptyField,
  IsStringField,
  MaxLengthField,
} from '@/shared-kernel/infrastructure/decorators/validators'

export class CreateTodoDto {
  @IsStringField()
  @IsNotEmptyField()
  @MaxLengthField(200)
  title: string

  @IsStringField()
  @IsOptional()
  @MaxLengthField(1000)
  description?: string

  @IsBooleanField()
  @IsOptional()
  isCompleted?: boolean
}
