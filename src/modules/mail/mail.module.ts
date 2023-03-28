import { Module } from '@nestjs/common';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { SES_AWS_SMTP_ENDPOINT, SES_AWS_SMTP_PASWORD, SES_AWS_SMTP_PORT, SES_AWS_SMTP_USERNAME } from 'src/constants';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: SES_AWS_SMTP_ENDPOINT,
        port: SES_AWS_SMTP_PORT,
        auth: {
          user: SES_AWS_SMTP_USERNAME,
          pass: SES_AWS_SMTP_PASWORD,
        },
      },
      defaults: {
        from: 'No Reply <danatravel.od2t@gmail.com>',
      },
    }),
    JwtModule,
  ],
  providers: [MailService, JwtService],
  exports: [MailService],
})
export class MailModule {}
