import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing
  app.use(cookieParser());

  // Enable CORS
  const corsOrigin = (process.env.CORS_ORIGINS || 'http://localhost:3001').split(',');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'plan'],
  });

  // Swagger конфигурация
  const config = new DocumentBuilder()
    .setTitle('DocSense API')
    .setDescription('AI Document Intelligence API')
    .setVersion('1.0')
    .addTag('docsense')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3002);
  console.log(`🚀 Server running at http://localhost:3002`);
  console.log(`📘 Swagger UI: http://localhost:3002/docs`);
}
bootstrap();
