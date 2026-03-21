import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AUTH_IDENTITY_REPOSITORY } from '@/modules/auth/application/ports/auth-identity.repository.port'
import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'
import { LOGIN_LOG_REPOSITORY } from '@/modules/auth/application/ports/login-log.repository.port'
import { PASSWORD_HASHER } from '@/modules/auth/application/ports/password-hasher.port'
import { SESSION_CLEANUP_PORT } from '@/modules/auth/application/ports/session-cleanup.port'
import { USER_ROLE_REPOSITORY } from '@/modules/auth/application/ports/user-role.repository.port'
import { USER_REPOSITORY } from '@/modules/auth/application/ports/user.repository.port'
import { VERIFICATION_TOKEN_REPOSITORY } from '@/modules/auth/application/ports/verification-token.repository.port'
import { AuthService } from '@/modules/auth/application/services/auth.service'
import { OAuthService } from '@/modules/auth/application/services/oauth.service'
import { AuthIdentityRepositoryImpl } from '@/modules/auth/infrastructure/repositories/auth-identity.repository'
import { AuthSessionRepositoryImpl } from '@/modules/auth/infrastructure/repositories/auth-session.repository'
import { LoginLogRepositoryImpl } from '@/modules/auth/infrastructure/repositories/login-log.repository'
import { UserRoleRepositoryImpl } from '@/modules/auth/infrastructure/repositories/user-role.repository'
import { UserRepositoryImpl } from '@/modules/auth/infrastructure/repositories/user.repository'
import { VerificationTokenRepositoryImpl } from '@/modules/auth/infrastructure/repositories/verification-token.repository'
import { BcryptPasswordHasher } from '@/modules/auth/infrastructure/services/bcrypt-password-hasher'
import { GithubStrategy } from '@/modules/auth/infrastructure/strategies/github.strategy'
import { GoogleStrategy } from '@/modules/auth/infrastructure/strategies/google.strategy'
import { JwtStrategy } from '@/modules/auth/infrastructure/strategies/jwt.strategy'
import { AuthController } from '@/modules/auth/presentation/controllers/auth.controller'
import { LoginLogController } from '@/modules/auth/presentation/controllers/login-log.controller'
import { OAuthController } from '@/modules/auth/presentation/controllers/oauth.controller'

import type { Env } from '@/app/config/env.schema'

/**
 * Auth module
 *
 * Provides authentication functionality
 */
@Global() // @global-approved: 暴露 SESSION_CLEANUP_PORT 供 scheduled-tasks 注入，无需显式 import AuthModule
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
    // Expose session cleanup to app-level scheduled tasks via shared-kernel port
    {
      provide: SESSION_CLEANUP_PORT,
      useExisting: AUTH_SESSION_REPOSITORY,
    },
  ],
  exports: [SESSION_CLEANUP_PORT],
})
export class AuthModule {}
