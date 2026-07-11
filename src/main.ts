import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'https://serabeauty.org',
      'https://www.seraphebeauty.org',
      'https://seraphe-beauty.vercel.app',
      'http://localhost:3000'
    ]
  })

  const config = new DocumentBuilder()
    .setTitle('Seraphe API')
    .setDescription('API documentation for the Seraphe app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
