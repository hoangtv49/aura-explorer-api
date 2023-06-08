import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../jwt/jwt-auth.module';
import { GoogleOauthController } from './google-oauth.controller';
import { GoogleOauthStrategy } from './google-oauth.strategy';
import { UserModule } from '../../components/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleOAuthService } from './google-oauth.service';

@Module({
  imports: [UserModule, JwtAuthModule, ConfigModule],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthStrategy, GoogleOAuthService],
})
export class GoogleOauthModule {}
