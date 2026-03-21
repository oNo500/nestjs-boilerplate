import { Controller, Get, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { OAuthService } from '@/modules/auth/application/services/oauth.service'

import type { Env } from '@/app/config/env.schema'
import type { OAuthUserProfile } from '@/modules/auth/application/ports/oauth.port'
import type { Request, Response } from 'express'

type OAuthRequest = Request & { user?: OAuthUserProfile }

@ApiTags('auth')
@Controller('auth/oauth')
export class OAuthController {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  // ── Google ────────────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  initiateGoogle() {
    // Passport AuthGuard('google') handles the redirect — this method is never reached
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(
    @Req() req: OAuthRequest,
    @Res() res: Response,
  ) {
    await this.handleCallback(req, res)
  }

  // ── GitHub ────────────────────────────────────────────────────────────────

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  initiateGithub() {
    // Passport AuthGuard('github') handles the redirect — this method is never reached
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubCallback(
    @Req() req: OAuthRequest,
    @Res() res: Response,
  ) {
    await this.handleCallback(req, res)
  }

  // ── Shared ────────────────────────────────────────────────────────────────

  private async handleCallback(req: OAuthRequest, res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('OAuth authentication failed')
    }

    const { accessToken, refreshToken } = await this.oauthService.findOrCreateUser(req.user)
    const frontendUrl = this.configService.get('FRONTEND_URL', { infer: true })
    const callbackUrl = `${frontendUrl}/oauth/callback?token=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`
    res.redirect(callbackUrl)
  }
}
