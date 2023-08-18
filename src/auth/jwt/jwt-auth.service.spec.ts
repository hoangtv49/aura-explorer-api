import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserService } from '../../../src/components/user/user.service';
import { JwtAuthService } from './jwt-auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { MESSAGES } from '../../shared';

describe('JwtAuthService', () => {
  let jwtAuthService: JwtAuthService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtAuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
            checkLastRequiredLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtAuthService = await module.get(JwtAuthService);
    jwtService = await module.get(JwtService);
    userService = await module.get(UserService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    const userInfo = { user: { id: 1, email: 'example@aura.network' } } as any;

    beforeEach(async () => {
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('sampleToken')
        .mockReturnValueOnce('sampleRefreshToken');
    });
    it('should return token to user', () => {
      const result = jwtAuthService.login(userInfo);
      const expected = {
        accessToken: 'sampleToken',
        refreshToken: 'sampleRefreshToken',
      };

      expect(result).toEqual(expected);
    });
  });

  // describe('refreshToken', () => {
  //   describe('when verifyToken successfully', () => {
  //     describe('when user found', () => {
  //       let user;
  //       const refreshTokenDecoded = { email: 'example@aura.network', iat: 123 };
  //       beforeEach(() => {
  //         user = { user: { name: 'aura' } };
  //         jest
  //           .spyOn(jwtService, 'verifyAsync')
  //           .mockResolvedValue(refreshTokenDecoded);
  //         jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
  //       });
  //       describe('when user pass checkLastRequiredLogin', () => {
  //         const newToken = {
  //           accessToken: 'accessToken',
  //           refreshToken: 'refreshToken',
  //         };
  //         beforeEach(() => {
  //           jest.spyOn(jwtAuthService, 'login').mockReturnValue(newToken);
  //         });
  //         it('should return token to user', async () => {
  //           const result = await jwtAuthService.refreshToken('token');

  //           expect(result).toEqual(newToken);
  //         });
  //       });
  //       describe('when user not pass checkLastRequiredLogin', () => {
  //         beforeEach(() => {
  //           jest.spyOn(jwtAuthService, 'login').mockImplementation(() => {
  //             throw new UnauthorizedException({
  //               code: MESSAGES.ERROR.NEED_TO_BE_LOGGED_IN_AGAIN.CODE,
  //               message: MESSAGES.ERROR.NEED_TO_BE_LOGGED_IN_AGAIN.MESSAGE,
  //             });
  //           });
  //         });

  //         it('should throw unauthorized error', async () => {
  //           const result = jwtAuthService.refreshToken('token');

  //           expect(result).rejects.toThrow(
  //             new UnauthorizedException({
  //               code: MESSAGES.ERROR.NEED_TO_BE_LOGGED_IN_AGAIN.CODE,
  //               message: MESSAGES.ERROR.NEED_TO_BE_LOGGED_IN_AGAIN.MESSAGE,
  //             }),
  //           );
  //         });
  //       });
  //     });
  //     describe('when user not found', () => {
  //       it('should throw error', async () => {
  //         const errorMsg = 'User not found in DB';
  //         jest
  //           .spyOn(jwtService, 'verifyAsync')
  //           .mockResolvedValue({ email: 'example@aura.netwok' });
  //         jest.spyOn(userService, 'findOneByEmail').mockReturnValue(undefined);

  //         const result = jwtAuthService.refreshToken('token');
  //         expect(result).rejects.toThrow(errorMsg);
  //       });
  //     });
  //   });

  //   describe('when verifyToken fails', () => {
  //     it('should throw error', async () => {
  //       const errorMsg = 'jwt malformed';

  //       jest.spyOn(jwtService, 'verifyAsync').mockImplementation(() => {
  //         throw new BadRequestException(errorMsg);
  //       });

  //       const result = jwtAuthService.refreshToken('token');
  //       expect(result).rejects.toThrow(errorMsg);
  //     });
  //   });
  // });
});
