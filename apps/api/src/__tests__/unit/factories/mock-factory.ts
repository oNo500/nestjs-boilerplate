/**
 * Mock provider factories for unit tests
 *
 * Each function returns an array of NestJS providers with mocked implementations,
 * suitable for use in Test.createTestingModule({ providers: [...] }).
 */
import { createMock } from '@golevelup/ts-vitest'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { AUTH_IDENTITY_REPOSITORY } from '@/modules/auth/application/ports/auth-identity.repository.port'
import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'
import { LOGIN_LOG_REPOSITORY } from '@/modules/auth/application/ports/login-log.repository.port'
import { PASSWORD_HASHER } from '@/modules/auth/application/ports/password-hasher.port'
import { USER_ROLE_REPOSITORY } from '@/modules/auth/application/ports/user-role.repository.port'
import { JOB_REPOSITORY } from '@/modules/order/application/ports/job.repository.port'
import { ORDER_REPOSITORY } from '@/modules/order/application/ports/order.repository.port'
import { PROFILE_REPOSITORY } from '@/modules/profile/application/ports/profile.repository.port'
import { USER_MANAGEMENT_REPOSITORY } from '@/modules/user-management/application/ports/user.repository.port'
import { USER_REPOSITORY } from '@/shared-kernel/application/ports/user.repository.port'
import { AUDIT_LOGGER } from '@/shared-kernel/infrastructure/audit/audit-logger.port'
import { DomainEventPublisher } from '@/shared-kernel/infrastructure/events/domain-event-publisher'

import type { AuthIdentityRepository } from '@/modules/auth/application/ports/auth-identity.repository.port'
import type { AuthSessionRepository } from '@/modules/auth/application/ports/auth-session.repository.port'
import type { LoginLogRepository } from '@/modules/auth/application/ports/login-log.repository.port'
import type { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port'
import type { UserRoleRepository } from '@/modules/auth/application/ports/user-role.repository.port'
import type { JobRepository } from '@/modules/order/application/ports/job.repository.port'
import type { OrderRepository } from '@/modules/order/application/ports/order.repository.port'
import type { ProfileRepository } from '@/modules/profile/application/ports/profile.repository.port'
import type { UserManagementRepository } from '@/modules/user-management/application/ports/user.repository.port'
import type { UserRepository } from '@/shared-kernel/application/ports/user.repository.port'
import type { AuditLogger } from '@/shared-kernel/infrastructure/audit/audit-logger.port'

export function createAuthServiceProviders() {
  return [
    { provide: AUTH_IDENTITY_REPOSITORY, useValue: createMock<AuthIdentityRepository>() },
    { provide: AUTH_SESSION_REPOSITORY, useValue: createMock<AuthSessionRepository>() },
    { provide: PASSWORD_HASHER, useValue: createMock<PasswordHasher>() },
    { provide: USER_ROLE_REPOSITORY, useValue: createMock<UserRoleRepository>() },
    { provide: USER_REPOSITORY, useValue: createMock<UserRepository>() },
    { provide: JwtService, useValue: createMock<JwtService>() },
    { provide: ConfigService, useValue: createMock<ConfigService>() },
    { provide: AUDIT_LOGGER, useValue: createMock<AuditLogger>() },
    { provide: LOGIN_LOG_REPOSITORY, useValue: createMock<LoginLogRepository>() },
  ]
}

export function createOAuthServiceProviders() {
  return [
    { provide: AUTH_IDENTITY_REPOSITORY, useValue: createMock<AuthIdentityRepository>() },
    { provide: AUTH_SESSION_REPOSITORY, useValue: createMock<AuthSessionRepository>() },
    { provide: USER_ROLE_REPOSITORY, useValue: createMock<UserRoleRepository>() },
    { provide: USER_REPOSITORY, useValue: createMock<UserRepository>() },
    { provide: JwtService, useValue: createMock<JwtService>() },
    { provide: ConfigService, useValue: createMock<ConfigService>() },
    { provide: AUDIT_LOGGER, useValue: createMock<AuditLogger>() },
  ]
}

export function createOrderServiceProviders() {
  return [
    { provide: ORDER_REPOSITORY, useValue: createMock<OrderRepository>() },
    { provide: JOB_REPOSITORY, useValue: createMock<JobRepository>() },
    { provide: DomainEventPublisher, useValue: createMock<DomainEventPublisher>() },
  ]
}

export function createUserServiceProviders() {
  return [
    { provide: USER_MANAGEMENT_REPOSITORY, useValue: createMock<UserManagementRepository>() },
  ]
}

export function createProfileServiceProviders() {
  return [
    { provide: PROFILE_REPOSITORY, useValue: createMock<ProfileRepository>() },
  ]
}
