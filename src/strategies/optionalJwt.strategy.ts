import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET_KEY } from 'src/constants';

@Injectable()
export class OptionalJwtStategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    console.log(payload);
    return { ...payload };
  }

  authenticate(req: any, options: any) {
    console.log('OK');
    const token = req.headers.authorization;

    if (token) {
      return super.authenticate(req, options);
    } else {
      return this.success({});
    }
  }
}
