import { createMock } from '@golevelup/ts-vitest'
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { vi } from 'vitest'

import { USER_MANAGEMENT_REPOSITORY } from '@/modules/user-management/application/ports/user.repository.port'
import { UserService } from '@/modules/user-management/application/services/user.service'

import type { UserInfo, UserManagementRepository } from '@/modules/user-management/application/ports/user.repository.port'
import type { TestingModule } from '@nestjs/testing'
import type { Mocked } from 'vitest'

const mockUserInfo = (overrides?: Partial<UserInfo>): UserInfo => ({
  id: 'user-id-1',
  name: 'Test User',
  displayName: null,
  email: 'test@example.com',
  emailVerified: false,
  image: null,
  role: 'USER',
  banned: false,
  banReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('userService', () => {
  let service: UserService
  let userRepository: Mocked<UserManagementRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: USER_MANAGEMENT_REPOSITORY, useValue: createMock<UserManagementRepository>() },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    userRepository = module.get(USER_MANAGEMENT_REPOSITORY)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('eMAIL_EXISTS → ConflictException', async () => {
      userRepository.existsByEmail.mockResolvedValue(true)

      await expect(
        service.create({ name: 'Test', email: 'existing@example.com', password: 'pw' }),
      ).rejects.toThrow(ConflictException)

      expect(userRepository.create).not.toHaveBeenCalled()
    })

    it('success → calls repository.create and returns UserInfo', async () => {
      const newUser = mockUserInfo({ email: 'new@example.com' })
      userRepository.existsByEmail.mockResolvedValue(false)
      userRepository.create.mockResolvedValue(newUser)

      const result = await service.create({
        name: 'New User',
        email: 'new@example.com',
        password: 'password',
      })

      expect(result).toEqual(newUser)
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com' }),
      )
    })
  })

  describe('assignRole', () => {
    it('actor === target → ForbiddenException (cannot change own role)', async () => {
      await expect(
        service.assignRole('user-id-1', 'ADMIN', 'user-id-1', 'ADMIN'),
      ).rejects.toThrow(ForbiddenException)
    })

    it('actor is not ADMIN → ForbiddenException', async () => {
      await expect(
        service.assignRole('target-id', 'ADMIN', 'actor-id', 'USER'),
      ).rejects.toThrow(ForbiddenException)
    })

    it('target not found → NotFoundException', async () => {
      userRepository.update.mockResolvedValue(null)

      await expect(
        service.assignRole('non-existent-id', 'ADMIN', 'admin-id', 'ADMIN'),
      ).rejects.toThrow(NotFoundException)
    })

    it('success → updates role, returns updated UserInfo', async () => {
      const updatedUser = mockUserInfo({ id: 'target-id', role: 'ADMIN' })
      userRepository.update.mockResolvedValue(updatedUser)

      const result = await service.assignRole('target-id', 'ADMIN', 'admin-id', 'ADMIN')

      expect(result.role).toBe('ADMIN')
      expect(userRepository.update).toHaveBeenCalledWith('target-id', { role: 'ADMIN' })
    })
  })

  describe('findById', () => {
    it('not found → NotFoundException', async () => {
      userRepository.findById.mockResolvedValue(null)

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException)
    })

    it('found → returns UserInfo', async () => {
      const user = mockUserInfo({ id: 'user-id-1' })
      userRepository.findById.mockResolvedValue(user)

      const result = await service.findById('user-id-1')

      expect(result).toEqual(user)
    })
  })
})
