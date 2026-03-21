import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy as GoogleOAuth2Strategy } from 'passport-google-oauth20'

import type { Env } from '@/app/config/env.schema'
import type { OAuthUserProfile } from '@/modules/auth/application/ports/oauth.port'
import type { VerifyCallback } from 'passport-oauth2'

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleOAuth2Strategy, 'google') {
  constructor(
    @Inject(ConfigService) configService: ConfigService<Env, true>,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID', { infer: true }) ?? 'placeholder',
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET', { infer: true }) ?? 'placeholder',
      callbackURL: `${configService.get('OAUTH_CALLBACK_BASE_URL', { infer: true })}/google/callback`,
      scope: ['email', 'profile'],
    })
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string
      displayName: string
      emails?: { value: string }[]
    },
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value
    if (!email) {
      done(new Error('No email returned from Google'))
      return
    }

    const oauthProfile: OAuthUserProfile = {
      provider: 'google',
      providerId: profile.id,
      email,
      name: profile.displayName,
      accessToken,
      refreshToken,
    }

    done(null, oauthProfile)
  }
}
