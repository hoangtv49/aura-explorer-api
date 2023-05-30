import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleOauthModule } from './google/google-oauth.module';
import { JwtAuthModule } from './jwt/jwt-auth.module';
import { UserModule } from 'src/components/user/user.module';
import { AuthController } from './auth.controller';
import { RefreshTokenModule } from 'src/components/refresh-token/refresh-token.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    GoogleOauthModule,
    JwtAuthModule,
    RefreshTokenModule,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
