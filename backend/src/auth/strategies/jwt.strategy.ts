import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import type { Request } from 'express';

interface AuthTokenPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookies: unknown = request.cookies;
          if (typeof cookies === 'object' && cookies !== null) {
            const token =
              'access_token' in cookies ? cookies.access_token : undefined;
            return typeof token === 'string' ? token : null;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: AuthTokenPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
