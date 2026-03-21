import { Global, Module } from '@nestjs/common'

import { PROFILE_REPOSITORY } from '@/modules/identity/application/ports/profile.repository.port'
import { IDENTITY_REPOSITORY } from '@/modules/identity/application/ports/user.repository.port'
import { UserService } from '@/modules/identity/application/services/user.service'
import { ProfileRepositoryImpl } from '@/modules/identity/infrastructure/repositories/profile.repository'
import { UserRepositoryImpl } from '@/modules/identity/infrastructure/repositories/user.repository'
import { ProfileController } from '@/modules/identity/presentation/controllers/profile.controller'
import { UserController } from '@/modules/identity/presentation/controllers/user.controller'
import { IDENTITY_PORT } from '@/shared-kernel/application/ports/identity.port'

@Global() // @global-approved: 用户身份共享子域，auth 及其他 context 通过 IDENTITY_PORT 查询用户
@Module({
  controllers: [UserController, ProfileController],
  providers: [
    UserService,
    {
      provide: IDENTITY_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepositoryImpl,
    },
    {
      provide: IDENTITY_PORT,
      useExisting: UserService,
    },
  ],
  exports: [IDENTITY_PORT],
})
export class IdentityModule {}
