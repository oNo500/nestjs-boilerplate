import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { OrderService } from '@/modules/order/application/services/order.service'
import { JobResponseDto } from '@/modules/order/presentation/dtos/order-response.dto'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

@ApiTags('jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly orderService: OrderService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get async job status' })
  @ApiParam({ name: 'id', description: 'Job ID (from the Location header in the 202 response)' })
  @ApiResponse({ status: 200, description: 'Query successful', type: JobResponseDto })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findById(@Param('id') id: string): Promise<JobResponseDto> {
    const job = await this.orderService.findJob(id)

    if (!job) {
      throw new NotFoundException({
        code: ErrorCode.JOB_NOT_FOUND,
        message: `Job ${id} not found`,
      })
    }

    return JobResponseDto.fromDomain(job)
  }
}
