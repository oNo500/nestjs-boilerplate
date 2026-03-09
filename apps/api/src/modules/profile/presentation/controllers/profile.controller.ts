import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { ProfileService } from '@/modules/profile/application/services/profile.service'
import { ProfileResponseDto } from '@/modules/profile/presentation/dtos/profile-response.dto'
import { UpdateProfileDto } from '@/modules/profile/presentation/dtos/update-profile.dto'
import { JwtAuthGuard } from '@/shared-kernel/infrastructure/guards'

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async getProfile(
    @Request() req: Express.Request & { user: { id: string } },
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.getProfile(req.user.id)
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      preferences: profile.preferences,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async updateProfile(
    @Request() req: Express.Request & { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.updateProfile(req.user.id, {
      displayName: dto.displayName,
      avatarUrl: dto.avatarUrl,
      bio: dto.bio,
      preferences: dto.preferences,
    })
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      preferences: profile.preferences,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }
  }
}
