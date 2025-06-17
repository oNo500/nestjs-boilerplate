import { Module } from '@nestjs/common';

import { UserController } from './UserController';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
