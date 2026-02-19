import { CanActivate, ExecutionContext, INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { ApiKeyGuard } from 'src/modules/apikey/apikey.guard';

// ✅ Мокаем Guard, чтобы не требовался реальный API-ключ
@Injectable()
class ApiKeyGuardMock implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true; // пропускаем все запросы
  }
}
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(ApiKeyGuard)
    .useClass(ApiKeyGuardMock)
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}

export { request };
