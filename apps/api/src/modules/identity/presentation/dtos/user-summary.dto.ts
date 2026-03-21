import { ApiProperty } from '@nestjs/swagger'

export class UserSummaryDto {
  @ApiProperty()
  total: number

  @ApiProperty()
  active: number

  @ApiProperty()
  adminCount: number

  @ApiProperty()
  newToday: number
}
