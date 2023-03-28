import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/components/user/users.service';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly usersService: UsersService) {
    super({
      clientID:
        '104732842746-6photgb908882d66bnkbi1td12v42bkt.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/api/v1/auth/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const { emails } = profile;

    const user = await this.usersService.findOne({
      where: { email: emails[0].value },
    });

    if (!user) {
      throw new NotFoundException('No user found');
    }

    return user;
  }
}
