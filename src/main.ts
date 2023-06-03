import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupAppConfiguration, setupSwagger } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  setupAppConfiguration(app);
  setupSwagger(app);

  await app.listen(3000);
}

bootstrap();
