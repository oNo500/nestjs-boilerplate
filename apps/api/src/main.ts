import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { bootstrap } from './bootstrap';

const main = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  await bootstrap(app);
};

main().catch((err) => {
  console.error('Error during main:', err);
  process.exit(1);
});
