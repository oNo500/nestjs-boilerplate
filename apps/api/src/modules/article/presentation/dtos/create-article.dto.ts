import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import {
  IsBooleanField,
  IsInField,
  IsStringField,
  MaxLengthField,
  MinLengthField,
} from '@/shared-kernel/infrastructure/decorators/validators'

import type { ArticleCategory } from '@/modules/article/domain/aggregates/article.aggregate'

const ARTICLE_CATEGORIES: ArticleCategory[] = ['tech', 'design', 'product', 'other']

export class CreateArticleDto {
  @ApiProperty({ example: 'Getting Started with NestJS' })
  @IsStringField()
  @MinLengthField(5, { message: 'Title must be at least 5 characters long' })
  @MaxLengthField(200, { message: 'Title must not exceed 200 characters' })
  title!: string

  @ApiProperty({ example: 'NestJS is a progressive Node.js framework...' })
  @IsStringField()
  @MinLengthField(1, { message: 'Content must not be empty' })
  content!: string

  @ApiPropertyOptional({ enum: ARTICLE_CATEGORIES, example: 'tech' })
  @IsOptional()
  @IsStringField()
  @IsInField(ARTICLE_CATEGORIES)
  category?: ArticleCategory

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsStringField()
  author?: string

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBooleanField()
  isPinned?: boolean
}
