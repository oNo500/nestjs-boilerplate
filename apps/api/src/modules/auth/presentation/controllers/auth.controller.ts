import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'

import { AuthService } from '@/modules/auth/application/services/auth.service'
import { LoginDto, LoginResponseDto } from '@/modules/auth/presentation/dtos/login.dto'
import { LogoutDto, LogoutResponseDto, LogoutAllResponseDto } from '@/modules/auth/presentation/dtos/logout.dto'
import { RefreshTokenDto, RefreshTokenResponseDto } from '@/modules/auth/presentation/dtos/refresh-token.dto'
import { RegisterDto, RegisterResponseDto } from '@/modules/auth/presentation/dtos/register.dto'
import { RevokeSessionDto, RevokeSessionResponseDto } from '@/modules/auth/presentation/dtos/revoke-session.dto'
import { SessionResponseDto } from '@/modules/auth/presentation/dtos/session-response.dto'
import { SessionsListResponseDto } from '@/modules/auth/presentation/dtos/sessions-list-response.dto'
import { JwtAuthGuard } from '@/modules/auth/presentation/guards/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: RegisterResponseDto })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return await this.authService.register(dto.email, dto.password, dto.name)
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Request() req: { headers: Record<string, string | string[] | undefined>, socket?: { remoteAddress?: string } },
  ): Promise<LoginResponseDto> {
    const deviceContext = {
      ipAddress: (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'] as string | undefined,
    }
    return await this.authService.login(dto.email, dto.password, deviceContext)
  }

  /**
   * No JwtAuthGuard: when the access token has expired, the refresh token is used to obtain a new one,
   * so Bearer authentication cannot pass at that point.
   * Refresh rotates the refresh token (the old one is revoked).
   */
  @Post('refresh-token')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Use a refresh token to obtain a new access token (the refresh token is rotated simultaneously)',
  })
  @ApiResponse({ status: 200, type: RefreshTokenResponseDto })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    return await this.authService.refreshToken(dto.refreshToken)
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current session info' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async getSession(
    @Request() req: Express.Request & { user: { id: string, email: string, roles: string[], sessionId: string } },
  ): Promise<SessionResponseDto> {
    const role = req.user.roles[0] ?? null
    return this.authService.getSession(req.user.sessionId, req.user.id, req.user.email, role)
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active sessions' })
  @ApiResponse({ status: 200, type: SessionsListResponseDto })
  async listSessions(
    @Request() req: Express.Request & { user: { id: string, sessionId: string } },
  ): Promise<SessionsListResponseDto> {
    return this.authService.listSessions(req.user.id, req.user.sessionId)
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (single device)' })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  async logout(@Body() dto: LogoutDto): Promise<LogoutResponseDto> {
    const success = await this.authService.logout(dto.refreshToken)
    return {
      success,
      message: success ? 'Logged out successfully' : 'Logout failed: session not found or already expired',
    }
  }

  @Post('revoke-session')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, type: RevokeSessionResponseDto })
  async revokeSession(
    @Body() dto: RevokeSessionDto,
    @Request() req: Express.Request & { user: { id: string, sessionId: string } },
  ): Promise<RevokeSessionResponseDto> {
    return this.authService.revokeSession(dto.sessionId, req.user.id, req.user.sessionId)
  }

  @Post('revoke-sessions')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all sessions' })
  @ApiResponse({ status: 200, type: LogoutAllResponseDto })
  async revokeSessions(
    @Request() req: Express.Request & { user: { id: string } },
  ): Promise<LogoutAllResponseDto> {
    const revokedCount = await this.authService.revokeAllSessions(req.user.id)
    return {
      revokedCount,
      message: `All sessions revoked successfully. Total: ${revokedCount}`,
    }
  }
}
