import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GoogleOauthGuard } from './google-oauth.guard';
import { JwtAuthService } from '../jwt/jwt-auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Tokens } from '../jwt/jwt-auth.service';
import { OAuth2Client } from 'google-auth-library';
import { GoogleOAuthService } from './google-oauth.service';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);
@ApiTags('auth')
@Controller('auth')
export class GoogleOauthController {
  constructor(
    private jwtAuthService: JwtAuthService,
    private googleOAuthService: GoogleOAuthService,
  ) {}

  @Get('google/:token')
  @ApiOperation({ summary: 'Verify google access token' })
  @ApiResponse({ status: HttpStatus.OK })
  async login(@Param('token') token: string): Promise<any> {
    const userInfo = await this.googleOAuthService.authenticate(token);
    const {
      user: { name: userName },
      picture,
    } = userInfo;
    const jwtTokens = await this.jwtAuthService.login(userInfo.user);
    return { ...jwtTokens, userName, picture };
  }
}
