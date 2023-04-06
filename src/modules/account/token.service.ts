import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EXPIRES_IN, JWT_SECRET_KEY, REFRESH_EXPIRES_IN, JWT_REFRESH_SECRET_KEY } from 'src/constants';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: EXPIRES_IN + `m`,
      secret: JWT_SECRET_KEY,
    });

    return accessToken;
  }

  async generateRefreshToken(payload: any) {
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: REFRESH_EXPIRES_IN + `m`,
      secret: JWT_REFRESH_SECRET_KEY,
    });

    return refreshToken;
  }

  async generateToken(payload: any) {
    const [token, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return { token, refreshToken };
  }
}
