import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'

import {
  IsIntField,
  MaxField,
  MinField,
} from '@/shared-kernel/infrastructure/decorators/validators'

/**
 * Offset pagination query DTO
 *
 * Performance characteristics:
 * - Query performance degrades with page number (offset=100k ~30ms)
 * - Inserts can cause duplicate or missing items
 * - Best for: small datasets (&lt;1,000 rows), page number navigation
 *
 * Usage guidance:
 * - Dataset < 1,000 rows: acceptable
 * - Dataset > 10,000 rows: prefer cursor pagination
 * - Need page number navigation: acceptable
 * - Real-time data / high write frequency: not recommended
 */
export class OffsetPaginationDto {
  /**
   * Page number (1-based)
   */
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsIntField()
  @MinField(1)
  page?: number = 1

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
}
