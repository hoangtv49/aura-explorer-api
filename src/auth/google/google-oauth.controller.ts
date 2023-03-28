import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GoogleOauthGuard } from './google-oauth.guard';
import { JwtAuthService } from '../jwt/jwt-auth.service';

@Controller('auth')
export class GoogleOauthController {
  constructor(private jwtAuthService: JwtAuthService) {}

  @Get()
  @UseGuards(GoogleOauthGuard)
  async googleAuth(@Req() _req) {
    // Guard redirects
  }

  @Get('redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { accessToken } = this.jwtAuthService.login(req.user);
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
    return res.redirect('/api/v1/validators');
  }
}
