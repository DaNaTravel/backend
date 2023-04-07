import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtStategy } from 'src/strategies/jwt.stratgy';
import { TokenService } from './token.service';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account, AccountSchema } from 'src/schemas/accounts';
import { RefreshTokenStrategy } from 'src/strategies/refreshToken.strategy';
import { GoogleStrategy } from '../../strategies/google.strategy';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';
import { FacebookStrategy } from 'src/strategies/facebook.strategy';
import { Token, TokenSchema } from 'src/schemas/tokens';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    PassportModule,
    JwtModule,
    MailModule,
  ],
  providers: [
    AccountService,
    JwtService,
    TokenService,
    JwtStategy,
    GoogleStrategy,
    RefreshTokenStrategy,
    FacebookStrategy,
    MailService,
  ],
  controllers: [AccountController],
})
export class AccountsModule {}
