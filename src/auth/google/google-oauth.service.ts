import { Injectable } from '@nestjs/common';
import { Tokens } from '../jwt/jwt-auth.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/components/user/user.service';
import { OAuth2Client } from 'google-auth-library';
import { PROVIDER, USER_ROLE } from 'src/shared';

@Injectable()
export class GoogleOAuthService {
  private googleOAuthClient: OAuth2Client;
  private readonly googleClientID: string;
  private readonly googleSecret: string;
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.googleClientID = this.configService.get('googleOAuth.clientId');
    this.googleSecret = this.configService.get('googleOAuth.clientSecret');
    this.googleOAuthClient = new OAuth2Client(
      this.googleClientID,
      this.googleSecret,
    );
  }
  async authenticate(token: string): Promise<any> {
    const tokenVerified = await this.googleOAuthClient.verifyIdToken({
      idToken: token,
      audience: this.googleClientID,
    });
    const userPayload = tokenVerified.getPayload();
    const { email: googleEmail, name, picture } = userPayload;
    const adminInitEmail = this.configService.get('adminInitEmail');

    let user = await this.userService.findOne({
      where: { provider: PROVIDER.GOOGLE, email: googleEmail },
    });

    // init first admin user by .env
    if (adminInitEmail === googleEmail && !user) {
      user = await this.userService.create({
        email: googleEmail,
        provider: PROVIDER.GOOGLE,
        name: name,
        role: USER_ROLE.ADMIN,
      });
    }

    this.userService.checkRole(user);

    return { user, picture };
  }
}
