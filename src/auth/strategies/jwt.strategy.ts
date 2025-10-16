import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.users.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        language: true,
        is_deleted: true,
      },
    });

    if (!user || user.is_deleted) {
      throw new UnauthorizedException('User not found or deleted');
    }

    return {
      id: user.id,
      userId: user.id, // Keep for backward compatibility
      email: user.email,
      displayName: user.display_name,
      role: user.role,
    };
  }
}
