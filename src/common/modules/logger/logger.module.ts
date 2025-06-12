import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: () => {
        return {
          forRoutes: ['*'],
          pinoHttp: {
            quietReqLogger: true,
            quietResLogger: true,
            name: 'Turborepo', // TODO: 项目名称需要抽象出来
            autoLogging: true,
            transport: {
              target: 'pino-pretty',
            },
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
