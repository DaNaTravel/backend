import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import {
  EMAIL_SENDER,
  KEY_SENDER,
  SES_AWS_SMTP_ENDPOINT,
  SES_AWS_SMTP_PASWORD,
  SES_AWS_SMTP_PORT,
  SES_AWS_SMTP_USERNAME,
} from 'src/constants';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'Gmail',
        auth: {
          user: EMAIL_SENDER,
          pass: KEY_SENDER,
        },
      },
    }),
    JwtModule,
  ],
  providers: [MailService, JwtService],
  exports: [MailService],
})
export class MailModule {}
