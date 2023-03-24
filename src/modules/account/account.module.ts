import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from 'src/google/google.strategy';
import { JwtStategy } from 'src/jwt/jwt.stratgy';
import { TokenService } from './token.service';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account, AccountSchema } from 'src/schemas/accounts';
import { RefreshTokenStrategy } from 'src/jwt/refreshToken.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    PassportModule,
    JwtModule,
  ],
  providers: [
    AccountService,
    JwtService,
    TokenService,
    GoogleStrategy,
    JwtStategy,
    RefreshTokenStrategy,
    {
      provide: 'AUTH_SERVICE',
      useClass: AccountService,
    },
  ],
  controllers: [AccountController],
})
export class AccountsModule {}
