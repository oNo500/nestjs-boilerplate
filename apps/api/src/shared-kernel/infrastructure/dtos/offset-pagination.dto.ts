import { Type } from 'class-transformer'
import { IsOptional, IsInt, Min, Max } from 'class-validator'

/**
 * Offset pagination DTO
 *
 * Performance characteristics:
 * - Query performance degrades with page number (~30ms at offset=100k)
 * - Data insertion may cause duplicates/omissions
 * - Use cases: Small datasets (<1,000 rows), page number navigation
 *
 * Recommendations:
 * - Dataset < 1,000 rows: OK to use
 * - Dataset > 10,000 rows: Use cursor pagination instead
 * - Page number navigation needed: OK to use
 * - Real-time data/high write frequency: Not recommended
 */
export class OffsetPaginationDto {
  /**
   * Page number (starts from 1)
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

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
}
