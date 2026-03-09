import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { ArticleService } from '@/modules/article/application/services/article.service'
import { AddTagDto } from '@/modules/article/presentation/dtos/add-tag.dto'
import { ArticleCursorQueryDto, ArticleQueryDto } from '@/modules/article/presentation/dtos/article-query.dto'
import {
  ArticleAllListResponseDto,
  ArticleCursorListResponseDto,
  ArticleListResponseDto,
  ArticleResponseDto,
} from '@/modules/article/presentation/dtos/article-response.dto'
import { CreateArticleDto } from '@/modules/article/presentation/dtos/create-article.dto'
import { UpdateArticleDto } from '@/modules/article/presentation/dtos/update-article.dto'
import { UseEnvelope } from '@/shared-kernel/infrastructure/decorators/use-envelope.decorator'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a draft article' })
  @ApiResponse({ status: 201, description: 'Article created successfully', type: ArticleResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async create(@Body() dto: CreateArticleDto): Promise<ArticleResponseDto> {
    try {
      const article = await this.articleService.create(
        dto.title,
        dto.content,
        dto.category,
        dto.author,
        dto.isPinned,
      )
      return ArticleResponseDto.fromDomain(article)
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({ code: ErrorCode.BAD_REQUEST, message: error.message })
      }
      throw error
    }
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article published successfully', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 400, description: 'Business rule violation (e.g. content is fewer than 50 characters)' })
  async publish(@Param('id') id: string): Promise<ArticleResponseDto> {
    try {
      const article = await this.articleService.publish(id)
      return ArticleResponseDto.fromDomain(article)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      if (error instanceof Error) {
        throw new BadRequestException({ code: ErrorCode.BAD_REQUEST, message: error.message })
      }
      throw error
    }
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article archived successfully', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 400, description: 'Business rule violation (e.g. article is not published)' })
  async archive(@Param('id') id: string): Promise<ArticleResponseDto> {
    try {
      const article = await this.articleService.archive(id)
      return ArticleResponseDto.fromDomain(article)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      if (error instanceof Error) {
        throw new BadRequestException({ code: ErrorCode.BAD_REQUEST, message: error.message })
      }
      throw error
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update article content (only draft articles are editable)' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article updated successfully', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 400, description: 'Business rule violation (e.g. article is already published)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    try {
      const article = await this.articleService.update(
        id,
        dto.title,
        dto.content,
        dto.category,
        dto.author,
        dto.isPinned,
      )
      return ArticleResponseDto.fromDomain(article)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      if (error instanceof Error) {
        throw new BadRequestException({ code: ErrorCode.BAD_REQUEST, message: error.message })
      }
      throw error
    }
  }

  @Post(':id/tags')
  @ApiOperation({ summary: 'Add a tag to an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Tag added successfully', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 400, description: 'Business rule violation (e.g. tag count limit exceeded)' })
  async addTag(
    @Param('id') id: string,
    @Body() dto: AddTagDto,
  ): Promise<ArticleResponseDto> {
    try {
      const article = await this.articleService.addTag(id, dto.tag)
      return ArticleResponseDto.fromDomain(article)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      if (error instanceof Error) {
        throw new BadRequestException({ code: ErrorCode.BAD_REQUEST, message: error.message })
      }
      throw error
    }
  }

  @Delete(':id/tags/:tag')
  @ApiOperation({ summary: 'Remove a tag from an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiParam({ name: 'tag', description: 'Tag name' })
  @ApiResponse({ status: 200, description: 'Tag removed successfully', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async removeTag(
    @Param('id') id: string,
    @Param('tag') tag: string,
  ): Promise<ArticleResponseDto> {
    const article = await this.articleService.removeTag(id, tag)
    return ArticleResponseDto.fromDomain(article)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 204, description: 'Article deleted successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async delete(@Param('id') id: string): Promise<void> {
    const success = await this.articleService.delete(id)
    if (!success) {
      throw new NotFoundException({ code: ErrorCode.ARTICLE_NOT_FOUND, message: `Article ${id} not found` })
    }
  }

  @Get('all')
  @UseEnvelope()
  @ApiOperation({ summary: 'Get all articles (no pagination; suitable for small datasets)' })
  @ApiResponse({ status: 200, type: ArticleAllListResponseDto })
  async findAll(): Promise<ArticleAllListResponseDto> {
    const articles = await this.articleService.findAll()
    return { object: 'list', data: ArticleResponseDto.fromDomainList(articles) }
  }

  @Get('paginated')
  @UseEnvelope()
  @ApiOperation({ summary: 'Get article list (offset pagination; default recommended approach)' })
  @ApiResponse({ status: 200, type: ArticleListResponseDto })
  async findPaginated(@Query() query: ArticleQueryDto): Promise<ArticleListResponseDto> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20

    const result = await this.articleService.findPaginated(page, pageSize, query.q)
    const totalPages = Math.ceil(result.total / pageSize)

    return {
      object: 'list',
      data: ArticleResponseDto.fromDomainList(result.data),
      page,
      pageSize,
      total: result.total,
      hasMore: page < totalPages,
    }
  }

  @Get('cursor')
  @UseEnvelope()
  @ApiOperation({ summary: 'Get article list (cursor pagination; suitable for large or real-time datasets)' })
  @ApiResponse({ status: 200, type: ArticleCursorListResponseDto })
  async findCursor(@Query() query: ArticleCursorQueryDto): Promise<ArticleCursorListResponseDto> {
    const pageSize = query.pageSize ?? 20
    const result = await this.articleService.findCursor(pageSize, query.cursor)
    return {
      object: 'list',
      data: ArticleResponseDto.fromDomainList(result.data),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article details by ID' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article found successfully', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findById(@Param('id') id: string): Promise<ArticleResponseDto> {
    const article = await this.articleService.findById(id)
    if (!article) {
      throw new NotFoundException({ code: ErrorCode.ARTICLE_NOT_FOUND, message: `Article ${id} not found` })
    }
    return ArticleResponseDto.fromDomain(article)
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get an article by slug' })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  @ApiResponse({ status: 200, description: 'Article found successfully', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findBySlug(@Param('slug') slug: string): Promise<ArticleResponseDto> {
    const article = await this.articleService.findBySlug(slug)
    if (!article) {
      throw new NotFoundException({ code: ErrorCode.ARTICLE_NOT_FOUND, message: `Article with slug "${slug}" not found` })
    }
    return ArticleResponseDto.fromDomain(article)
  }
}
