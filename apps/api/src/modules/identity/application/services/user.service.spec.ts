import { createMock } from '@golevelup/ts-vitest'
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { vi } from 'vitest'

import { UserFixtures } from '@/__tests__/unit/factories/domain-fixtures'
import { UserService } from '@/modules/identity/application/services/user.service'

import type { DomainEventPublisher } from '@/app/events/domain-event-publisher'
import type { IdentityRepository } from '@/modules/identity/application/ports/user.repository.port'
import type { DeepMocked } from '@golevelup/ts-vitest'

describe('userService', () => {
  let service: UserService
  let userRepository: DeepMocked<IdentityRepository>
  let eventPublisher: DeepMocked<DomainEventPublisher>

  beforeEach(() => {
    userRepository = createMock<IdentityRepository>()
    eventPublisher = createMock<DomainEventPublisher>()
    eventPublisher.publish.mockResolvedValue()
    service = new UserService(userRepository, eventPublisher)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('email exists → ConflictException, no repository.create call', async () => {
      userRepository.existsByEmail.mockResolvedValue(true)

      await expect(
        service.create({ name: 'Test', email: 'existing@example.com', password: 'pw' }),
      ).rejects.toThrow(ConflictException)

      expect(userRepository.create).not.toHaveBeenCalled()
    })

    it('success → calls repository.create, publishes UserCreatedEvent, returns UserInfo', async () => {
      const newUser = UserFixtures.user({ email: 'new@example.com' })
      userRepository.existsByEmail.mockResolvedValue(false)
      userRepository.create.mockResolvedValue(newUser)

      const result = await service.create({ name: 'New User', email: 'new@example.com', password: 'password' })

      expect(result).toEqual(newUser)
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com' }),
      )
      expect(eventPublisher.publish).toHaveBeenCalledOnce()
    })
  })

  describe('assignRole', () => {
    it('actor === target → ForbiddenException', async () => {
      await expect(service.assignRole('user-id-1', 'ADMIN', 'user-id-1', 'ADMIN')).rejects.toThrow(ForbiddenException)
    })

    it('actor is not ADMIN → ForbiddenException', async () => {
      await expect(service.assignRole('target-id', 'ADMIN', 'actor-id', 'USER')).rejects.toThrow(ForbiddenException)
    })

    it('target not found → NotFoundException', async () => {
      userRepository.findById.mockResolvedValue(null)

      await expect(service.assignRole('non-existent-id', 'ADMIN', 'admin-id', 'ADMIN')).rejects.toThrow(NotFoundException)
    })

    it('success → updates role, publishes UserRoleAssignedEvent, returns updated UserInfo', async () => {
      const existing = UserFixtures.user({ id: 'target-id' })
      const updatedUser = UserFixtures.admin({ id: 'target-id' })
      userRepository.findById.mockResolvedValue(existing)
      userRepository.update.mockResolvedValue(updatedUser)

      const result = await service.assignRole('target-id', 'ADMIN', 'admin-id', 'ADMIN')

      expect(result.role).toBe('ADMIN')
      expect(userRepository.update).toHaveBeenCalledWith('target-id', { role: 'ADMIN' })
      expect(eventPublisher.publish).toHaveBeenCalledOnce()
    })
  })

  describe('findById', () => {
    it('not found → NotFoundException', async () => {
      userRepository.findById.mockResolvedValue(null)

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException)
    })

    it('found → returns UserInfo', async () => {
      const user = UserFixtures.user({ id: 'user-id-1' })
      userRepository.findById.mockResolvedValue(user)

      const result = await service.findById('user-id-1')

      expect(result).toEqual(user)
    })
  })
})
