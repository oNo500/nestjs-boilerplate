import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtValidateUser } from '@/types/interface/jwt';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser(@CurrentUser() user: JwtValidateUser) {
    return this.userService.getUser(user.userId);
  }
}
