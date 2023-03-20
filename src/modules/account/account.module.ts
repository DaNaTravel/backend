import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountsModule {}
