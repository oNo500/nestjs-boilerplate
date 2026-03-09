import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UserService } from '@/modules/user-management/application/services/user.service'
import { AssignRoleDto } from '@/modules/user-management/presentation/dtos/assign-role.dto'
import { CreateUserDto } from '@/modules/user-management/presentation/dtos/create-user.dto'
import { UpdateUserDto } from '@/modules/user-management/presentation/dtos/update-user.dto'
import { UserQueryDto } from '@/modules/user-management/presentation/dtos/user-query.dto'
import {
  UserListResponseDto,
  UserResponseDto,
} from '@/modules/user-management/presentation/dtos/user-response.dto'
import { UserSummaryDto } from '@/modules/user-management/presentation/dtos/user-summary.dto'
import { Roles } from '@/shared-kernel/infrastructure/decorators/roles.decorator'
import { UseEnvelope } from '@/shared-kernel/infrastructure/decorators/use-envelope.decorator'
import { JwtAuthGuard, RolesGuard } from '@/shared-kernel/infrastructure/guards'

import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

/**
 * Adapted to better-auth schema: hard delete / single role / banned boolean
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseEnvelope()
  @ApiOperation({ summary: 'Get user list' })
  @ApiResponse({ status: 200, type: UserListResponseDto })
  async findAll(@Query() query: UserQueryDto): Promise<UserListResponseDto> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20

    const result = await this.userService.findAll({
      page,
      pageSize,
      search: query.search,
      role: query.role,
      banned: query.banned,
    })

    const totalPages = Math.ceil(result.total / pageSize)

    return {
      object: 'list',
      data: result.data,
      total: result.total,
      page,
      pageSize,
      hasMore: page < totalPages,
    }
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get user summary statistics' })
  @ApiResponse({ status: 200, type: UserSummaryDto })
  async getSummary(): Promise<UserSummaryDto> {
    return this.userService.getSummary()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.userService.findById(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create({
      name: dto.name ?? dto.email.split('@')[0]!,
      displayName: dto.displayName,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    })
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, {
      name: dto.name,
      displayName: dto.displayName,
      banned: dto.banned,
      banReason: dto.banReason,
    })
  }

  @Put(':id/role')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign user role (ADMIN only)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRoleDto,
    @Request() req: { user: { id: string, roles: RoleType[] } },
  ): Promise<UserResponseDto> {
    return this.userService.assignRole(id, dto.role, req.user.id, req.user.roles[0]!)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.delete(id)
  }
}
