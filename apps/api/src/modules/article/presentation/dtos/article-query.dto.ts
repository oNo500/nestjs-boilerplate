import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

import { CursorPaginationDto } from '@/shared-kernel/infrastructure/dtos/cursor-pagination.dto'
import { OffsetPaginationDto } from '@/shared-kernel/infrastructure/dtos/offset-pagination.dto'

export class ArticleQueryDto extends OffsetPaginationDto {
  @ApiPropertyOptional({ example: 'nestjs architecture' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string
}

export class ArticleCursorQueryDto extends CursorPaginationDto {}
