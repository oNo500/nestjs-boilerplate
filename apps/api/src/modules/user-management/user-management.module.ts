import { Module } from '@nestjs/common'

import { USER_MANAGEMENT_REPOSITORY } from '@/modules/user-management/application/ports/user.repository.port'
import { UserService } from '@/modules/user-management/application/services/user.service'
import { UserManagementRepositoryImpl } from '@/modules/user-management/infrastructure/repositories/user.repository'
import { UserController } from '@/modules/user-management/presentation/controllers/user.controller'

/**
 * User Management module
 *
 * Provides user management functionality (CRUD, pagination, filtering)
 */
@Module({
  controllers: [UserController],
  providers: [
    // Application Service
    UserService,

    // Repository implementation (DIP)
    {
      provide: USER_MANAGEMENT_REPOSITORY,
      useClass: UserManagementRepositoryImpl,
    },
  ],
  exports: [UserService],
})
export class UserManagementModule {}
