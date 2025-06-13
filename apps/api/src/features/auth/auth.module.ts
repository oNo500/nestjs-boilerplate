import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { NodeMailerModule } from '@/common/modules/node-mailer/node-mailer.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OptsService } from './opts.service';
import { MailService } from './mail.service';
import { SessionService } from './session.service';

@Module({
  imports: [NodeMailerModule, ConfigModule],
  providers: [AuthService, OptsService, MailService, SessionService],
  controllers: [AuthController],
})
export class AuthModule {}
