import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EXPIRES_IN, JWT_SECRET_KEY, REFRESH_EXPIRES_IN, JWT_REFRESH_SECRET_KEY } from 'src/constants';
import { convertToTimeStamp } from 'src/utils';
import { RedisService } from 'nestjs-redis';
import { resetPasswordTokenDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Token, TokenDocument } from 'src/schemas/tokens';
import { Model } from 'mongoose';
@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private readonly tokenRepo: Model<TokenDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async generateAccessToken(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: EXPIRES_IN + `m`,
      secret: JWT_SECRET_KEY,
    });

    const tokenExpireIn = convertToTimeStamp(EXPIRES_IN);

    return { expireIn: tokenExpireIn, token: accessToken };
  }

  async generateRefreshToken(payload: any) {
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: REFRESH_EXPIRES_IN + `m`,
      secret: JWT_REFRESH_SECRET_KEY,
    });

    const refreshTokenExpireIn = convertToTimeStamp(REFRESH_EXPIRES_IN);

    return { expireIn: refreshTokenExpireIn, token: refreshToken };
  }

  async generateToken(payload: any) {
    const [token, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return { token, refreshToken };
  }

  async createToken(payload: any) {
    const token = await this
  }
}
