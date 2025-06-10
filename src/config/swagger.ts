import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swagger = (app: NestExpressApplication) => {
  const swaggerConfig = new DocumentBuilder().setTitle('NestJS API').build();
  // .addBearerAuth()
  // .build(); // TODO 添加 Bearer Auth
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);
};
