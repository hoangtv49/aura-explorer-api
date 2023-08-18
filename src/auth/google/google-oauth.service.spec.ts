import { Test } from '@nestjs/testing';
import { GoogleOAuthService } from './google-oauth.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../components/user/user.service';
import { JwtAuthService } from '../jwt/jwt-auth.service';
import { UnauthorizedException } from '@nestjs/common';
// import { User } from 'src/shared/entities/user.entity';
import { User } from '../../shared/entities/user.entity';
import { MESSAGES, PROVIDER, SITE, USER_ROLE } from '../../shared';

describe('GoogleOAuthService', () => {
  let googleOAuthService: GoogleOAuthService;
  let configService: ConfigService;
  let userService: UserService;
  let jwtAuthService: JwtAuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GoogleOAuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            checkRole: jest.fn().mockImplementation((args) => {
              if (args?.role === USER_ROLE.BANNED) {
                throw new UnauthorizedException(MESSAGES.ERROR.NOT_PERMISSION);
              } else if (args?.role === USER_ROLE.USER) {
                throw new UnauthorizedException(MESSAGES.ERROR.NOT_PERMISSION);
              }
            }),
          },
        },
        {
          provide: JwtAuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    googleOAuthService = await module.get(GoogleOAuthService);
    userService = await module.get(UserService);
    configService = await module.get(ConfigService);
    jwtAuthService = await module.get(JwtAuthService);

    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    describe('when verifyIdToken get wrong input', () => {
      it('should throw error', async () => {
        const request = {
          token: '1',
          site: SITE.MAIN,
        };

        expect(googleOAuthService.authenticate(request)).rejects.toThrow(
          'Wrong number of segments in token: 1',
        );
      });
    });

    describe('when verifyIdToken return value', () => {
      const picture = 'https://example.com/exampleaura.jpg';
      const adminInitEmail = 'exampleaura@aura.network';

      beforeEach(() => {
        googleOAuthService['googleOAuthClient' as any] = {
          verifyIdToken: jest.fn().mockResolvedValue({
            getPayload() {
              return {
                email: adminInitEmail,
                picture: picture,
              };
            },
          }),
        };
      });
      describe('when found user', () => {
        let user: User;

        beforeEach(() => {
          user = {
            id: 1,
            name: 'aura',
            provider: PROVIDER.GOOGLE,
            role: USER_ROLE.ADMIN,
            email: 'exampleaura@aura.network',
            encryptedPassword: null,
            verificationToken: null,
            verifiedAt: null,
            resetPasswordToken: null,
            userActivities: null,
            created_at: new Date(),
            updated_at: new Date(),
            lastRequiredLogin: null,
          };
          jest.spyOn(userService, 'findOne').mockResolvedValue(user);
        });
        describe('when user email is admin email', () => {
          beforeEach(() => {
            configService.get = jest.fn().mockReturnValue(user.email);
          });
          describe('when the site is main', () => {
            const request = {
              token: 'sampleToken',
              site: SITE.MAIN,
            };
            describe('when user is not verified yet', () => {
              it('should return user information', async () => {
                const result = await googleOAuthService.authenticate(request);

                expect(result.user.verifiedAt).not.toBeNull();
                expect(result).toEqual({ user, picture });
              });
            });
            describe('when user is verified yet', () => {
              const verifiedAt = new Date();

              beforeEach(() => {
                user.verifiedAt = verifiedAt;
                jest.spyOn(userService, 'findOne').mockResolvedValue(user);
              });

              it('should return user information', async () => {
                const request = {
                  token: 'sampleToken',
                  site: SITE.MAIN,
                };
                const result = await googleOAuthService.authenticate(request);

                expect(result.user.verifiedAt).toEqual(verifiedAt);
                expect(result).toEqual({ user, picture });
              });
            });
          });
          describe('when the site is admin', () => {
            const request = {
              token: 'sampleToken',
              site: SITE.ADMIN,
            };
            describe('when user is not verified yet', () => {
              describe('when user pass checkRole', () => {
                it('should return user information', async () => {
                  const result = await googleOAuthService.authenticate(request);

                  expect(result.user.verifiedAt).not.toBeNull();
                  expect(result).toEqual({ user, picture });
                });
              });
              describe('when user not pass checkRole', () => {
                beforeEach(() => {
                  user.role = USER_ROLE.BANNED;
                });

                it('should return user information', async () => {
                  const result = googleOAuthService.authenticate(request);

                  expect(result).rejects.toThrow(MESSAGES.ERROR.NOT_PERMISSION);
                });
              });
            });
          });
        });
        describe('when user email is not admin email', () => {
          beforeEach(() => {
            user.role = USER_ROLE.USER;
          });
          describe('when the site is main', () => {
            const request = {
              token: 'sampleToken',
              site: SITE.MAIN,
            };
            describe('when user is not verified yet', () => {
              it('should return user information', async () => {
                const result = await googleOAuthService.authenticate(request);

                expect(result.user.verifiedAt).not.toBeNull();
                expect(result).toEqual({ user, picture });
              });
            });
            describe('when user verified yet', () => {
              const verifiedAt = new Date();

              beforeEach(() => {
                user.verifiedAt = verifiedAt;
              });
              it('should set verifiedAt to user and return user information', async () => {
                const result = await googleOAuthService.authenticate(request);

                expect(result.user.verifiedAt).toEqual(verifiedAt);
                expect(result).toEqual({ user, picture });
              });
            });
          });
          describe('when the site is admin', () => {
            const request = {
              token: 'sampleToken',
              site: SITE.ADMIN,
            };
            it('should throw error', async () => {
              const result = googleOAuthService.authenticate(request);

              expect(result).rejects.toThrow(MESSAGES.ERROR.NOT_PERMISSION);
            });
          });
        });
      });
      describe('when not found user', () => {
        let user: User;

        beforeEach(() => {
          const newDate = new Date();
          user = {
            id: 1,
            name: 'aura',
            provider: PROVIDER.GOOGLE,
            role: USER_ROLE.ADMIN,
            email: 'exampleaura@aura.network',
            encryptedPassword: null,
            verificationToken: null,
            verifiedAt: newDate,
            resetPasswordToken: null,
            userActivities: null,
            created_at: newDate,
            updated_at: newDate,
            lastRequiredLogin: null,
          };

          jest.spyOn(userService, 'findOne').mockResolvedValue(undefined);
          jest.spyOn(userService, 'create').mockResolvedValue(user);
        });
        describe('when user email is admin email', () => {
          beforeEach(() => {
            configService.get = jest.fn().mockReturnValue(user.email);
          });

          describe('when the site is main', () => {
            const request = {
              token: 'sampleToken',
              site: SITE.MAIN,
            };

            it('should set verifiedAt to user and return user information', async () => {
              const result = await googleOAuthService.authenticate(request);

              expect(result).toEqual({ user, picture });
            });
          });
          describe('when the site is admin', () => {
            const request = {
              token: 'sampleToken',
              site: SITE.ADMIN,
            };

            it('should throw unauthorized error', async () => {
              const result = await googleOAuthService.authenticate(request);

              expect(result).toEqual({ user, picture });
            });
          });
        });
        describe('when user email is not admin email', () => {
          beforeEach(() => {
            configService.get = jest
              .fn()
              .mockReturnValue('anotheraura@aura.network');
            user.role = USER_ROLE.USER;
            jest.spyOn(userService, 'create').mockResolvedValue(user);
          });
          describe('when the site is main', () => {
            const request = {
              token: 'sampleToken',
              site: SITE.MAIN,
            };
            it('should return user information', async () => {
              const result = await googleOAuthService.authenticate(request);

              expect(result).toEqual({ user, picture });
            });
          });
          describe('when the site is admin', () => {
            const request = {
              token: 'sampleToken',
              site: SITE.ADMIN,
            };

            it('should throw unauthorized error', async () => {
              const result = googleOAuthService.authenticate(request);

              expect(result).rejects.toThrow(
                "Cannot read properties of undefined (reading 'verifiedAt')",
              );
            });
          });
        });
      });
    });
  });

  describe('login', () => {
    describe('when authenticate return value', () => {
      let userInfo;
      const picture = 'https://example.com/exampleaura.jpg';

      beforeEach(() => {
        (userInfo = {
          user: {
            name: 'aura',
            email: 'exampleaura@aura.network',
            provider: PROVIDER.GOOGLE,
          },
          picture: picture,
        }),
          jest
            .spyOn(googleOAuthService, 'authenticate')
            .mockResolvedValue(userInfo);
      });
      describe('when jwtAuthService.login return value', () => {
        beforeEach(() => {
          jest.spyOn(jwtAuthService, 'login').mockReturnValue({
            accessToken: 'exampleToken',
            refreshToken: 'exampleTokenRefresh',
          });
        });
        it('should return user information and tokens', async () => {
          const result = await googleOAuthService.login({
            token: 'exampleToken',
            site: null,
          });
          const expected = {
            accessToken: 'exampleToken',
            picture: 'https://example.com/exampleaura.jpg',
            provider: 'google',
            refreshToken: 'exampleTokenRefresh',
            userEmail: 'exampleaura@aura.network',
            userName: 'aura',
          };

          expect(result).toEqual(expected);
        });
      });
      describe('when jwtAuthService.login throw error', () => {
        beforeEach(() => {
          jest.spyOn(jwtAuthService, 'login').mockImplementation(() => {
            throw new UnauthorizedException('User not found in DB.');
          });
        });
        it('should throw error', async () => {
          const result = googleOAuthService.login({
            token: 'exampleToken',
            site: null,
          });

          expect(result).rejects.toThrow('User not found in DB.');
        });
      });
    });
    describe('when authenticate throw error', () => {
      beforeEach(() => {
        jest
          .spyOn(googleOAuthService, 'authenticate')
          .mockImplementation(() => {
            throw new UnauthorizedException(MESSAGES.ERROR.NOT_PERMISSION);
          });
      });
      it('should throw error', async () => {
        const result = googleOAuthService.login({
          token: 'exampleToken',
          site: null,
        });

        expect(result).rejects.toThrow(MESSAGES.ERROR.NOT_PERMISSION);
      });
    });
  });
});
