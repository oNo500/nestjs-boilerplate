import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { swagger } from '@/config/swagger';
import { Env } from '@/config/env';

export const bootstrap = async (app: NestExpressApplication) => {
  const configService = app.get(ConfigService<Env>);
  const logger = app.get(Logger);

  if (configService.get('NODE_ENV') !== 'production') {
    swagger(app);
  }
  app.use(
    helmet({
      permittedCrossDomainPolicies: false,
    }),
  );
  app.setGlobalPrefix('api', {
    exclude: [
      {
        path: '/',
        method: RequestMethod.GET,
      },
      {
        path: '/api-docs',
        method: RequestMethod.GET,
      },
      {
        path: '/health',
        method: RequestMethod.GET,
      },
    ],
  });

  app.useStaticAssets('./uploads', {
    prefix: '/assets',
  });

  app.enableCors({
    credentials: true,
    // origin:  // TODO: add origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 只允许DTO中有定义的属性，自动剔除多余属性
      forbidNonWhitelisted: true, // 如果有未定义的属性，抛出异常而不是静默剔除
      transform: true, // 自动转换请求参数为DTO声明的类型
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换（如字符串转数字）
      },
    }),
  );

  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  await app.listen(configService.get('PORT'), () => {
    logger.log(
      `This application started at ${configService.get('HOST')}:${configService.get('PORT')}`,
    );
  });
};
