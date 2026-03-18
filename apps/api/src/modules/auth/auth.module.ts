import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AUTH_IDENTITY_REPOSITORY } from '@/modules/auth/application/ports/auth-identity.repository.port'
import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'
import { LOGIN_LOG_REPOSITORY } from '@/modules/auth/application/ports/login-log.repository.port'
import { PASSWORD_HASHER } from '@/modules/auth/application/ports/password-hasher.port'
import { USER_ROLE_REPOSITORY } from '@/modules/auth/application/ports/user-role.repository.port'
import { VERIFICATION_TOKEN_REPOSITORY } from '@/modules/auth/application/ports/verification-token.repository.port'
import { AuthService } from '@/modules/auth/application/services/auth.service'
import { OAuthService } from '@/modules/auth/application/services/oauth.service'
import { AuthIdentityRepositoryImpl } from '@/modules/auth/infrastructure/repositories/auth-identity.repository'
import { AuthSessionRepositoryImpl } from '@/modules/auth/infrastructure/repositories/auth-session.repository'
import { LoginLogRepositoryImpl } from '@/modules/auth/infrastructure/repositories/login-log.repository'
import { UserRoleRepositoryImpl } from '@/modules/auth/infrastructure/repositories/user-role.repository'
import { VerificationTokenRepositoryImpl } from '@/modules/auth/infrastructure/repositories/verification-token.repository'
import { BcryptPasswordHasher } from '@/modules/auth/infrastructure/services/bcrypt-password-hasher'
import { GithubStrategy } from '@/modules/auth/infrastructure/strategies/github.strategy'
import { GoogleStrategy } from '@/modules/auth/infrastructure/strategies/google.strategy'
import { JwtStrategy } from '@/modules/auth/infrastructure/strategies/jwt.strategy'
import { AuthController } from '@/modules/auth/presentation/controllers/auth.controller'
import { LoginLogController } from '@/modules/auth/presentation/controllers/login-log.controller'
import { OAuthController } from '@/modules/auth/presentation/controllers/oauth.controller'
import { USER_REPOSITORY } from '@/shared-kernel/application/ports/user.repository.port'
import { UserRepositoryImpl } from '@/shared-kernel/infrastructure/repositories/user.repository'

import type { Env } from '@/app/config/env.schema'

/**
 * Auth module
 *
 * Provides authentication functionality
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<Env, true>) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', { infer: true }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, OAuthController, LoginLogController],
  providers: [
    AuthService,
    OAuthService,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,

    // Repository implementations (DIP)
    {
      provide: AUTH_IDENTITY_REPOSITORY,
      useClass: AuthIdentityRepositoryImpl,
    },
    {
      provide: AUTH_SESSION_REPOSITORY,
      useClass: AuthSessionRepositoryImpl,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: USER_ROLE_REPOSITORY,
      useClass: UserRoleRepositoryImpl,
    },
    {
      provide: VERIFICATION_TOKEN_REPOSITORY,
      useClass: VerificationTokenRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    {
      provide: LOGIN_LOG_REPOSITORY,
      useClass: LoginLogRepositoryImpl,
    },
  ],
  exports: [AuthService, USER_ROLE_REPOSITORY, AUTH_SESSION_REPOSITORY],
})
export class AuthModule {}
