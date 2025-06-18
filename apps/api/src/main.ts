import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { bootstrap } from './bootstrap';
import { InternalDisabledLogger } from './config/internal.logger';

const main = async () => {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // bufferLogs: true,
    snapshot: true,
    logger: new InternalDisabledLogger(),
  });
  await bootstrap(app);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
