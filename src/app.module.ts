import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_URI } from './constants';
import { AccountsModule } from './modules/account/account.module';
import { MailModule } from './modules/mail/mail.module';
import { LocationModule } from './modules/location/location.module';
import { RouteModule } from './modules/route/route.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(MONGO_URI),
    AccountsModule,
    MailModule,
    LocationModule,
    RouteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
