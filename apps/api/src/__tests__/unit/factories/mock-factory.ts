/**
 * Mock factories for unit tests
 *
 * Each function returns typed mock instances via createMock&lt;T>(),
 * suitable for direct instantiation: new SomeService(...createAuthMocks())
 */
import { createMock } from '@golevelup/ts-vitest'

import type { DomainEventPublisher } from '@/app/events/domain-event-publisher'
import type { AuthIdentityRepository } from '@/modules/auth/application/ports/auth-identity.repository.port'
import type { AuthSessionRepository } from '@/modules/auth/application/ports/auth-session.repository.port'
import type { LoginLogRepository } from '@/modules/auth/application/ports/login-log.repository.port'
import type { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port'
import type { UserRoleRepository } from '@/modules/auth/application/ports/user-role.repository.port'
import type { UserRepository } from '@/modules/auth/application/ports/user.repository.port'
import type { IdentityRepository } from '@/modules/identity/application/ports/user.repository.port'
import type { JobRepository } from '@/modules/order/application/ports/job.repository.port'
import type { OrderRepository } from '@/modules/order/application/ports/order.repository.port'
import type { CachePort } from '@/shared-kernel/application/ports/cache.port'
import type { ConfigService } from '@nestjs/config'
import type { JwtService } from '@nestjs/jwt'

export function createAuthMocks() {
  return {
    authIdentityRepo: createMock<AuthIdentityRepository>(),
    authSessionRepo: createMock<AuthSessionRepository>(),
    passwordHasher: createMock<PasswordHasher>(),
    userRoleRepo: createMock<UserRoleRepository>(),
    userRepo: createMock<UserRepository>(),
    jwtService: createMock<JwtService>(),
    configService: createMock<ConfigService>(),
    eventPublisher: createMock<DomainEventPublisher>(),
    loginLogRepo: createMock<LoginLogRepository>(),
  }
}

export function createOAuthMocks() {
  return {
    authIdentityRepo: createMock<AuthIdentityRepository>(),
    authSessionRepo: createMock<AuthSessionRepository>(),
    userRoleRepo: createMock<UserRoleRepository>(),
    userRepo: createMock<UserRepository>(),
    jwtService: createMock<JwtService>(),
    configService: createMock<ConfigService>(),
    eventPublisher: createMock<DomainEventPublisher>(),
  }
}

export function createOrderMocks() {
  return {
    orderRepository: createMock<OrderRepository>(),
    jobRepository: createMock<JobRepository>(),
    cache: createMock<CachePort>(),
    domainEventPublisher: createMock<DomainEventPublisher>(),
  }
}

export function createUserMocks() {
  return {
    userRepository: createMock<IdentityRepository>(),
    eventPublisher: createMock<DomainEventPublisher>(),
  }
}
