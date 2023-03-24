import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_URI } from './constants';
import { AccountsModule } from './modules/account/account.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(MONGO_URI),
    AccountsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
