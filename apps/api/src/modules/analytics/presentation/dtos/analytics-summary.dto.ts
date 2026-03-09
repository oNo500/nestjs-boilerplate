import { ApiProperty } from '@nestjs/swagger'

export class AnalyticsSummaryDto {
  @ApiProperty({ description: 'Number of articles published today' })
  publishedToday!: number

  @ApiProperty({ description: 'Number of completed orders' })
  completedOrders!: number
}
