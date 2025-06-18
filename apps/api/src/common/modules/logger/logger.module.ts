import { Module } from '@nestjs/common';
import { pick } from 'lodash';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

const redactFields = [
  'req.headers.authorization',
  'req.body.password',
  'req.body.confirmPassword',
  'req.headers.cookie',
];
const basePinoOptions = {
  translateTime: true,
  ignore: 'pid,hostname',
  singleLine: true,
  redact: redactFields,
};

const productionPinoOptions = [
  {
    target: 'pino/file',
    level: 'info', // log only errors to file
    options: {
      ...basePinoOptions,
      destination: 'logs/info.log',
      mkdir: true,
      sync: false,
    },
  },
  {
    target: 'pino/file',
    level: 'error', // log only errors to file
    options: {
      ...basePinoOptions,
      destination: 'logs/error.log',
      mkdir: true,
      sync: false,
    },
  },
];
const developmentPinoOptions = [
  {
    target: 'pino-pretty',
    level: 'info', // log only info and above to console
    options: {
      ...basePinoOptions,
      colorize: true,
    },
  },
  {
    target: 'pino/file',
    level: 'info', // log only errors to file
    options: {
      ...basePinoOptions,
      destination: 'logs/info.log',
      mkdir: true,
      sync: false,
    },
  },
  {
    target: 'pino/file',
    level: 'error', // log only errors to file
    options: {
      ...basePinoOptions,
      destination: 'logs/error.log',
      mkdir: true,
      sync: false,
    },
  },
];

const pinoOptions = process.env.NODE_ENV === 'production' ? productionPinoOptions : developmentPinoOptions;

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: () => {
        return {
          forRoutes: ['*'],
          pinoHttp: {
            exclude: [{ method: ['GET', 'POST', 'PUT', 'DELETE'], path: 'docs' }],

            timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,

            // quietReqLogger: true,
            // quietResLogger: true,
            name: 'Turbo',
            // autoLogging: true,
            customProps: () => ({
              context: 'HTTP',
            }),
            serializers: {
              req(request: {
                body: Record<string, any>;
                headers: Record<string, any>;
                raw: {
                  body: Record<string, any>;
                };
              }) {
                request.body = request.raw.body;

                return {
                  ...pick(request, [
                    'method',
                    'url',
                    'remoteAddress',
                    'body',
                    'statusCode',
                    'responseTime',
                    'query',
                    'params',
                    'ip',
                    'userAgent',
                    'referrer',
                    'protocol',
                  ]),
                  ...pick(request.headers, ['user-agent', 'referer', 'host']),
                };
              },
              res(response: { statusCode: number; headers: Record<string, any> }) {
                return {
                  ...pick(response, ['statusCode']),
                  ...pick(response.headers, ['content-length', 'content-type']),
                };
              },
            },
            redact: {
              paths: redactFields,
              censor: '**GDPR COMPLIANT**',
            },
            transport: {
              targets: pinoOptions,
            },
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
