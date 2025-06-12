import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule } from '@/common/modules/logger/logger.module';
import { LoggerMiddleware } from '@/common/middleware/logger.middleware';

import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env';
import { AuthModule } from '@/features/auth/auth.module.js';
import { UsersModule } from '@/features/users/users.module';
import { MailModule } from '@/features/mail/mail.module';
import { DrizzleModule } from '@/common/modules/drizzle/drizzle.module';
import { NodeMailerModule } from '@/common/modules/node-mailer/node-mailer.module';
import { HealthModule } from '@/features/health/health.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottleModule } from '@/common/modules/throttle/throttle.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    JwtModule.register({
      global: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule,
    AuthModule,
    UsersModule,
    ThrottleModule,
    NodeMailerModule,
    MailModule,
    DrizzleModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * 配置全局中间件
   * @param consumer 中间件消费者，用于应用中间件到路由
   */
  configure(consumer: MiddlewareConsumer) {
    // 将 LoggerMiddleware 应用到所有路由
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
