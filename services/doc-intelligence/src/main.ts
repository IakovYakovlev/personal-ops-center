import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger конфигурация
  const config = new DocumentBuilder()
    .setTitle('DocSense API')
    .setDescription('AI Document Intelligence API')
    .setVersion('1.0')
    .addTag('docsense')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3002);
  console.log(`🚀 Server running at http://localhost:3002`);
  console.log(`📘 Swagger UI: http://localhost:3002/docs`);
}
bootstrap();
