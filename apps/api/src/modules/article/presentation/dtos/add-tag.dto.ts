import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class AddTagDto {
  @ApiProperty({ example: 'nestjs' })
  @IsString()
  @MinLength(1, { message: 'Tag must not be empty' })
  @MaxLength(30, { message: 'Tag must not exceed 30 characters' })
  tag!: string
}
