import { Global, Module } from '@nestjs/common'

import { IDENTITY_REPOSITORY } from '@/modules/identity/application/ports/user.repository.port'
import { UserService } from '@/modules/identity/application/services/user.service'
import { UserRepositoryImpl } from '@/modules/identity/infrastructure/repositories/user.repository'
import { UserController } from '@/modules/identity/presentation/controllers/user.controller'
import { IDENTITY_PORT } from '@/shared-kernel/application/ports/identity.port'

@Global() // @global-approved: 用户身份共享子域，auth 及其他 context 通过 IDENTITY_PORT 查询用户
@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: IDENTITY_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    {
      provide: IDENTITY_PORT,
      useExisting: UserService,
    },
  ],
  exports: [IDENTITY_PORT],
})
export class IdentityModule {}
