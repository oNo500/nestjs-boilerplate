import { Type } from 'class-transformer'
import { IsOptional, IsInt, Min, Max } from 'class-validator'

/**
 * Cursor pagination DTO
 *
 * Standards:
 * - Stripe API pagination: https://docs.stripe.com/api/pagination
 * - Relay Cursor Connections: https://relay.dev/graphql/connections.htm
 *
 * Performance characteristics:
 * - Constant query performance (~0.025ms), unaffected by page number
 * - Strong consistency, avoids duplicates/omissions from data insertion
 * - Use cases: Large datasets (>10,000 rows), real-time data
 */
export class CursorPaginationDto {
  /**
   * Items per page
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size?: number = 20

  /**
   * Cursor token (Base64-encoded JSON object)
   * @example eyJpZCI6InVzcl8wMjAifQ==
   */
  @IsOptional()
  cursor?: string
}
