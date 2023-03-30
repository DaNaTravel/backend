import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { HOST, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, PORT } from 'src/constants';
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: `http://${HOST}:${PORT}/accounts/facebook-redirect`,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = {
      email: profile.emails ? profile.emails[0].value : `danatravel${profile.id}@gmail.com`,
      name: profile.name.familyName + profile.name.middleName + profile.name.givenName,
    };
    return user || null;
  }
}
