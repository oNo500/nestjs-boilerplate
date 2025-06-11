import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from './core/logger/logger.module';
import { LoggerMiddleware } from '@/core/middleware/logger.middleware';

import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/config/env';
import { AuthModule } from '@/shared/auth/auth.module';
import { UsersModule } from '@/features/users/users.module';
import { MailModule } from '@/shared/mail/mail.module';
import { DrizzleModule } from '@/shared/drizzle/drizzle.module';
import { NodeMailerModule } from '@/core/node-mailer/node-mailer.module';
import { HealthModule } from './shared/health/health.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@/core/guards';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottleModule } from '@/core/throttle/throttle.module';

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
  controllers: [AppController],
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
