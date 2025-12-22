import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'

import { AuthService } from '@/modules/auth/application/services/auth.service'
import { LoginDto, LoginResponseDto } from '@/modules/auth/presentation/dtos/login.dto'
import { RefreshTokenDto, RefreshTokenResponseDto } from '@/modules/auth/presentation/dtos/refresh-token.dto'
import { RegisterDto, RegisterResponseDto } from '@/modules/auth/presentation/dtos/register.dto'
import { SessionResponseDto } from '@/modules/auth/presentation/dtos/session-response.dto'
import { JwtAuthGuard } from '@/modules/auth/presentation/guards/jwt-auth.guard'

/**
 * Auth Controller v2
 *
 * v2 authentication endpoints
 * Changes:
 * - session endpoint returns session and user info
 * - New refresh-token endpoint (real implementation)
 * - Returns refreshToken
 */
@ApiTags('auth')
@Controller('v2/auth')
export class AuthV2Controller {
  constructor(private readonly authService: AuthService) {}

  /**
   * User registration
   */
  @Post('register')
  @ApiOperation({ summary: 'User registration (v2)' })
  @ApiResponse({ status: 201, type: RegisterResponseDto })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return await this.authService.register(dto.email, dto.password, dto.name)
  }

  /**
   * User login
   */
  @Post('login')
  @ApiOperation({ summary: 'User login (v2)' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(dto.email, dto.password)
  }

  /**
   * Get current session info (requires authentication)
   */
  @Get('session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current session info (v2)',
    description: 'Returns current session and user info',
  })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async getSession(
    @Request()
    req: Express.Request & { user: { id: string, email: string, roles: string[], sessionId: string } },
  ): Promise<SessionResponseDto> {
    const role = req.user.roles[0] ?? null
    return this.authService.getSession(req.user.sessionId, req.user.id, req.user.email, role)
  }

  /**
   * Refresh access token (v2 real implementation)
   */
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token (v2)',
    description: 'Use Refresh Token to get new Access Token',
  })
  @ApiResponse({ status: 200, type: RefreshTokenResponseDto })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    return await this.authService.refreshToken(dto.refreshToken)
  }
}
