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
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    PassportModule,
    JwtModule,
    MailModule,
  ],
  providers: [AccountService, JwtService, TokenService, JwtStategy, GoogleStrategy, RefreshTokenStrategy],
  controllers: [AccountController],
})
export class AccountsModule {}
