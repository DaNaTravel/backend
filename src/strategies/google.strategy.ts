import { Injectable } from '@nestjs/common';
import { Profile } from 'passport-google-oauth20';
import { Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, HOST, PORT } from 'src/constants';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `http://${HOST}:${PORT}/accounts/google-redirect`,
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = {
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0].value,
    };

    return user || null;
  }
}
