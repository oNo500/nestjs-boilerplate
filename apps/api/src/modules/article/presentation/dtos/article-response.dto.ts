import { ApiProperty } from '@nestjs/swagger'

import { CursorListResponseDto, ListResponseDto, OffsetListResponseDto } from '@/shared-kernel/infrastructure/dtos/list-response.dto'

import type { Article, ArticleCategory } from '@/modules/article/domain/aggregates/article.aggregate'
import type { ArticleStatus } from '@/modules/article/domain/enums/article-status.enum'

export class ArticleResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string

  @ApiProperty({ example: 'Getting Started with NestJS' })
  title!: string

  @ApiProperty({ example: 'NestJS is a progressive Node.js framework...' })
  content!: string

  @ApiProperty({ example: 'getting-started-with-nestjs' })
  slug!: string

  @ApiProperty({ enum: ['draft', 'published', 'archived'], example: 'draft' })
  status!: ArticleStatus

  @ApiProperty({ type: [String], example: ['nestjs', 'typescript'] })
  tags!: string[]

  @ApiProperty({ enum: ['tech', 'design', 'product', 'other'], example: 'tech' })
  category!: ArticleCategory

  @ApiProperty({ example: 'John Doe' })
  author!: string

  @ApiProperty({ example: 42 })
  viewCount!: number

  @ApiProperty({ example: false })
  isPinned!: boolean

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date

  @ApiProperty({ type: String, example: '2026-01-01T00:00:00.000Z', nullable: true })
  publishedAt!: Date | null

  static fromDomain(article: Article): ArticleResponseDto {
    const dto = new ArticleResponseDto()
    dto.id = article.id
    dto.title = article.title.value
    dto.content = article.content.value
    dto.slug = article.slug.value
    dto.status = article.status
    dto.tags = [...article.tags.value]
    dto.category = article.category
    dto.author = article.author
    dto.viewCount = article.viewCount
    dto.isPinned = article.isPinned
    dto.createdAt = article.createdAt
    dto.updatedAt = article.updatedAt
    dto.publishedAt = article.publishedAt

    return dto
  }

  static fromDomainList(articles: Article[]): ArticleResponseDto[] {
    return articles.map((article) => ArticleResponseDto.fromDomain(article))
  }
}

export class ArticleListResponseDto extends OffsetListResponseDto<ArticleResponseDto> {
  @ApiProperty({ type: () => ArticleResponseDto, isArray: true })
  declare data: ArticleResponseDto[]
}

export class ArticleAllListResponseDto extends ListResponseDto<ArticleResponseDto> {
  @ApiProperty({ type: () => ArticleResponseDto, isArray: true })
  declare data: ArticleResponseDto[]
}

export class ArticleCursorListResponseDto extends CursorListResponseDto<ArticleResponseDto> {
  @ApiProperty({ type: () => ArticleResponseDto, isArray: true })
  declare data: ArticleResponseDto[]
}
