import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/schemas/accounts';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }])],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountsModule {}
