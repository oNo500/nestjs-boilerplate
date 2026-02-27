import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { DashboardService } from '@/modules/dashboard/application/services/dashboard.service'
import { StatisticsDto } from '@/modules/dashboard/presentation/dtos/statistics.dto'
import { JwtAuthGuard } from '@/shared-kernel/infrastructure/guards'

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, type: StatisticsDto })
  async getStatistics(): Promise<StatisticsDto> {
    return this.dashboardService.getStatistics()
  }
}
