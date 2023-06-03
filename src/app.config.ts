import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma.filter';
import { json } from 'express';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupAppConfiguration = (app: INestApplication) => {
  // GLOBAL PIPES AND FILTERS
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new PrismaExceptionFilter());

  // SET GLOBAL JSON BODY LIMIT
  app.use(json({ limit: '10mb' }));

  // SET GLOBAL SECURITY
  app.enableCors();
  app.use(helmet());

  // GLOBAL PREFIX AND VERSIONING PREFIX
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
};

export const setupSwagger = (app: INestApplication) => {
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
};
