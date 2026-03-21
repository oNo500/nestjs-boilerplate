import { Body, Controller, Get, Inject, NotFoundException, Patch, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { PROFILE_REPOSITORY } from '@/modules/identity/application/ports/profile.repository.port'
import { ProfileResponseDto, UpdateProfileDto } from '@/modules/identity/presentation/dtos/profile.dto'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

import type { ProfileRepository } from '@/modules/identity/application/ports/profile.repository.port'

@ApiTags('Profile')
@Controller('profile')
@ApiBearerAuth()
export class ProfileController {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: ProfileRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async getProfile(
    @Request() req: { user: { id: string } },
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileRepository.findById(req.user.id)
    if (!profile) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: 'Profile not found' })
    }
    return profile
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileRepository.update(req.user.id, {
      displayName: dto.displayName,
      bio: dto.bio,
      avatarUrl: dto.avatarUrl,
    })
    if (!profile) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: 'Profile not found' })
    }
    return profile
  }
}
