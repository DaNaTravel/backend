import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EXPIRES_IN, JWT_SECRET_KEY, REFRESH_EXPIRES_IN, JWT_REFRESH_SECRET_KEY } from 'src/constants';
import { Token, TokenDocument } from 'src/schemas/tokens';

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

  async verifyToken(token: string) {
    const payload = await this.jwtService.verify(token, { secret: JWT_SECRET_KEY });
    return payload;
  }

  async createToken(code: string) {
    const payload = { code };
    const [hashToken] = await Promise.all([
      this.generateAccessToken(payload),
      new this.tokenRepo({ token: code }).save(),
    ]);

    return hashToken;
  }

  async findToken(payload: any) {
    const isExist = await this.tokenRepo.findOne({ token: payload }).lean();
    return Boolean(isExist);
  }

  async deleteToken(code: string) {
    const deletedToken = await this.tokenRepo.findOneAndDelete({ token: code });
    return Boolean(deletedToken);
  }
}
