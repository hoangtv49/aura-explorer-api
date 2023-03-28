import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleOauthModule } from './google/google-oauth.module';
import { JwtAuthModule } from './jwt/jwt-auth.module';
import { UsersModule } from 'src/components/user/users.module';

@Module({
  imports: [UsersModule, PassportModule, GoogleOauthModule, JwtAuthModule],
})
export class AuthModule {}
