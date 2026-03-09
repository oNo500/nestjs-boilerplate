import { ApiProperty } from '@nestjs/swagger'

/**
 * Base class for non-paginated list responses
 */
export class ListResponseDto<T> {
  @ApiProperty({
    description: 'Object type identifier',
    example: 'list',
    enum: ['list'],
  })
  readonly object = 'list' as const

  @ApiProperty({
    description: 'Actual data array',
    isArray: true,
  })
  data: T[]
}

/**
 * Base class for offset-paginated list responses
 *
 * Spec:
 * - Google AIP-158 + Stripe API hybrid style
 * - Flat structure, computed fields removed
 */
export class OffsetListResponseDto<T> extends ListResponseDto<T> {
  @ApiProperty({
    description: 'Current page number (1-based)',
    example: 1,
  })
  page: number

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  pageSize: number

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number

  @ApiProperty({
    description: 'Whether there are more items',
    example: true,
  })
  hasMore: boolean
}

/**
 * Base class for cursor-paginated list responses
 */
export class CursorListResponseDto<T> extends ListResponseDto<T> {
  @ApiProperty({
    type: String,
    description: 'Next page cursor token (Base64-encoded); null when no more data',
    example: 'eyJpZCI6InVzcl8wMjAifQ==',
    nullable: true,
  })
  nextCursor: string | null

  @ApiProperty({ description: 'Whether there are more items', example: true })
  hasMore: boolean
}
