import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'

import {
  IsIntField,
  MaxField,
  MinField,
} from '@/shared-kernel/infrastructure/decorators/validators'

/**
 * Cursor pagination query DTO
 *
 * Spec:
 * - Stripe API pagination: https://docs.stripe.com/api/pagination
 * - Relay Cursor Connections: https://relay.dev/graphql/connections.htm
 *
 * Performance characteristics:
 * - Constant query performance (~0.025ms), independent of page number
 * - Strong consistency; avoids duplicate/missing items caused by inserts
 * - Best for: large datasets (>10,000 rows), real-time data
 */
export class CursorPaginationDto {
  /**
   * Number of items per page
   */
  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsIntField()
  @MinField(1)
  @MaxField(100)
  pageSize?: number = 20

  /**
   * Cursor token (Base64-encoded JSON object)
   */
  @ApiPropertyOptional({ example: 'eyJpZCI6InVzcl8wMjAifQ==' })
  @IsOptional()
  cursor?: string
}
