import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    AuthModule,
    UsersModule,
    NodeMailerModule,
    MailModule,
    DrizzleModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
