import { Env } from '@/config/env';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => ({
        transport: {
          // service: config.get('MAIL_HOST'), // 使用Gmail等服务时可以使用service
          host: config.get('MAIL_HOST'),
          port: config.get('MAIL_PORT'),
          // secure: config.get('MAIL_SECURE'),
          // // ignoreTLS: true, // 添加此选项
          // tls: {
          //   // 不验证证书
          //   rejectUnauthorized: false,
          //   // 允许自签名证书
          //   minVersion: 'TLSv1.2',
          // },

          auth: {
            user: config.get('MAIL_USERNAME'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
      }),
    }),
  ],
})
export class NodeMailerModule {}
