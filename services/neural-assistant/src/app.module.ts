import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentsModule } from './documents/documents.module';
import { ChatListModule } from './chat-list/chat-list.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    AuthModule,
    DocumentsModule,
    ChatListModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
