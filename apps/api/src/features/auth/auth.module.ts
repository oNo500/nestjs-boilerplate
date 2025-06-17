import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

import { NodeMailerModule } from '@/common/modules/node-mailer/node-mailer.module';
import { LocalStrategy } from '@/common/strategies/local.strategy';
import { JwtStrategy } from '@/common/strategies/jwt.strategy';
import { JwtAuthGuard } from '@/common/guards';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OptsService } from './opts.service';
import { MailService } from './mail.service';
import { TokenService } from './token.service';

@Module({
  imports: [NodeMailerModule, ConfigModule, PassportModule],
  providers: [
    AuthService,
    OptsService,
    MailService,
    LocalStrategy,
    JwtStrategy,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
