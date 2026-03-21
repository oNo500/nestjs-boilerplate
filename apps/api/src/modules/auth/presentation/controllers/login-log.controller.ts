import { Controller, Get, Inject, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { LOGIN_LOG_REPOSITORY } from '@/modules/auth/application/ports/login-log.repository.port'
import { LoginLogQueryDto } from '@/modules/auth/presentation/dtos/login-log-query.dto'
import { LoginLogListResponseDto } from '@/modules/auth/presentation/dtos/login-log-response.dto'
import { Roles } from '@/shared-kernel/infrastructure/decorators/roles.decorator'

import type { LoginLogRepository } from '@/modules/auth/application/ports/login-log.repository.port'

@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth()
export class LoginLogController {
  constructor(
    @Inject(LOGIN_LOG_REPOSITORY)
    private readonly loginLogRepository: LoginLogRepository,
  ) {}

  @Get('login-logs')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Query login log list (ADMIN only)' })
  @ApiResponse({ status: 200, type: LoginLogListResponseDto })
  async findAll(@Query() query: LoginLogQueryDto): Promise<LoginLogListResponseDto> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20

    const { data, total } = await this.loginLogRepository.findAll({
      page,
      pageSize,
      email: query.email,
      status: query.status,
    })

    return {
      object: 'list',
      data: data.map((log) => ({
        id: log.id,
        userId: log.userId,
        email: log.email,
        status: log.status,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        failReason: log.failReason,
        createdAt: log.createdAt,
      })),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    }
  }
}
