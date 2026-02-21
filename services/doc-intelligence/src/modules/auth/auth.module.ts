import { Module } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtGuard],
  exports: [JwtGuard, JwtModule],
})
export class AuthModule {}
