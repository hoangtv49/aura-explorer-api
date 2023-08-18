import { Test } from '@nestjs/testing';
import { GoogleOauthController } from './google-oauth.controller';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleOAuthLoginResponseDto } from '../../components/google/dtos/google-oauth-login.response.dto';
import { GoogleOAuthLoginParamsDto } from '../../components/google/dtos/google-oauth-login.params.dto';

describe('GoogleOauthController', () => {
  let googleOauthController: GoogleOauthController;
  let googleOAuthService: GoogleOAuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [GoogleOauthController],
      providers: [
        {
          provide: GoogleOAuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    googleOauthController = module.get<GoogleOauthController>(
      GoogleOauthController,
    );
    googleOAuthService = module.get<GoogleOAuthService>(GoogleOAuthService);
  });

  describe('login', () => {
    it('should return user access tokens', async () => {
      const mockTokens: GoogleOAuthLoginResponseDto = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        userName: 'mockUserName',
        userEmail: 'examplexxx@aura.network',
        provider: 'google',
        picture: 'https://example.com/xxx',
      };
      const mockRequest: GoogleOAuthLoginParamsDto = {
        token: 'mockToken',
        site: null,
      };

      jest.spyOn(googleOAuthService, 'login').mockResolvedValue(mockTokens);

      const result = await googleOauthController.login(mockRequest);

      expect(result).toEqual(mockTokens);
    });
  });
});
