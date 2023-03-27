import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'danatravel.od2t@gmail.com',
          pass: 'zzylgklfrgyvumdf',
        },
      },
      defaults: {
        from: 'No Reply <danatravel.od2t@gmail.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
