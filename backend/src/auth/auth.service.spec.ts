jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError } from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService refresh token handling', () => {
  const usersService = {
    findById: jest.fn(),
    updateRefreshToken: jest.fn(),
  };
  const jwtService = {
    verify: jest.fn(),
  };
  const configService = {
    getOrThrow: jest.fn().mockReturnValue('refresh-secret'),
  };
  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('converts invalid JWTs into unauthorized responses', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new JsonWebTokenError('invalid token');
    });

    await expect(authService.refreshTokens('invalid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects refresh tokens without a workspace claim', async () => {
    jwtService.verify.mockReturnValue({ sub: 'user-id' });

    await expect(
      authService.refreshTokens('signed-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersService.findById).not.toHaveBeenCalled();
  });

  it('does not mask user lookup failures as invalid credentials', async () => {
    const databaseError = new Error('database unavailable');
    jwtService.verify.mockReturnValue({
      sub: 'user-id',
      workspaceId: 'workspace-id',
    });
    usersService.findById.mockRejectedValue(databaseError);

    await expect(authService.refreshTokens('signed-token')).rejects.toBe(
      databaseError,
    );
  });
});
