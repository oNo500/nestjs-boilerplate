import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy as PassportGithubStrategy } from 'passport-github2'

import type { Env } from '@/app/config/env.schema'
import type { OAuthUserProfile } from '@/modules/auth/application/ports/oauth.port'
import type { VerifyCallback } from 'passport-oauth2'

@Injectable()
export class GithubStrategy extends PassportStrategy(PassportGithubStrategy, 'github') {
  constructor(
    @Inject(ConfigService) configService: ConfigService<Env, true>,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID', { infer: true }) ?? 'placeholder',
      clientSecret: configService.get('GITHUB_CLIENT_SECRET', { infer: true }) ?? 'placeholder',
      callbackURL: `${configService.get('OAUTH_CALLBACK_BASE_URL', { infer: true })}/github/callback`,
      scope: ['user:email'],
    })
  }

  validate(
    accessToken: string,
    _refreshToken: string,
    profile: {
      id: string
      displayName: string
      username?: string
      emails?: { value: string }[]
    },
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value
    if (!email) {
      done(new Error('No email returned from GitHub. Ensure your GitHub account has a public email.'))
      return
    }

    const oauthProfile: OAuthUserProfile = {
      provider: 'github',
      providerId: profile.id,
      email,
      name: profile.displayName ?? profile.username ?? email.split('@')[0]!,
      accessToken,
    }

    done(null, oauthProfile)
  }
}
