import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { json } from 'express';
import { PrismaExceptionFilter } from './common/filters/prisma.filter';
import helmet from 'helmet';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  // GLOBAL PIPES AND FILTERS
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new PrismaExceptionFilter());

  // SET GLOBAL JSON BODY LIMIT
  app.use(json({ limit: '10mb' }));

  // SET GLOBAL SECURITY
  app.enableCors();
  app.use(helmet());
  app.use(csurf());

  // GLOBAL PREFIX AND VERSIONING PREFIX
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // SWAGGER DOCUMENTATION
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Survey API')
      .setDescription('The survey API documentation')
      .setVersion('1.0')
      .addTag('REST API')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(3000);
}
bootstrap();
