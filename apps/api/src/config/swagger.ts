import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swagger = (app: NestExpressApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS API')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setDescription('NestJS API Documentation')
    .setVersion('0.0.1')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    explorer: true,
  });
};
