import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { LoggerModule } from '@/common/modules/logger/logger.module';
import { HealthModule } from '@/features/health/health.module';
import { DrizzleModule } from '@/common/modules/drizzle/drizzle.module';
import { validateEnv } from '@/config/env';
import { LoggerMiddleware } from '@/common/middleware';
import { NodeMailerModule } from '@/common/modules/node-mailer/node-mailer.module';
import { AuthModule } from '@/features/auth/auth.module';
import { UserModule } from '@/features/user/user.module';
import { RolesGuard } from '@/common/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    JwtModule.register({
      global: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    LoggerModule,
    DrizzleModule,
    HealthModule,
    AuthModule,
    NodeMailerModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
