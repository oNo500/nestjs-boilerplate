import { ApiProperty } from '@nestjs/swagger'

export class MonthlyOverviewItemDto {
  @ApiProperty({ description: 'Month in YYYY-MM format', example: '2025-03' })
  month!: string

  @ApiProperty({ description: 'Number of new registered users' })
  newUsers!: number

  @ApiProperty({ description: 'Number of published articles' })
  publishedArticles!: number

  @ApiProperty({ description: 'Number of login attempts' })
  loginAttempts!: number
}

export class MonthlyOverviewDto {
  @ApiProperty({ type: [MonthlyOverviewItemDto] })
  months!: MonthlyOverviewItemDto[]
}
