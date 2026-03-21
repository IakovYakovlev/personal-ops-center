import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const corsOrigin = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'plan'],
  });

  // Swagger конфигурация
  const config = new DocumentBuilder()
    .setTitle('Neural Assistant API')
    .setDescription('AI Neural Assistant API')
    .setVersion('1.0')
    .addTag('neural-assistant')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3003);

  console.log(`🚀 Server running at http://localhost:${process.env.PORT ?? 3003}`);
  console.log(`📘 Swagger UI: http://localhost:${process.env.PORT ?? 3003}/docs`);
}
bootstrap();
