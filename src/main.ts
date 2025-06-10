import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { bootstrap } from './bootstrap';
import { NestExpressApplication } from '@nestjs/platform-express';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();

const main = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  await bootstrap(app);
};

main().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1);
});
