import { Module } from '@nestjs/common';
import { AccountsModule } from './modules/account/account.module';

@Module({
  imports: [AccountsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
