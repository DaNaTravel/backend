import { AuthGuard } from '@nestjs/passport';

export class GoogleAuthGuard extends AuthGuard('google') {}
export class FacebookAuthGuard extends AuthGuard('facebook') {}
