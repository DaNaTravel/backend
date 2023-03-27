import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailConfirm(email: string, name: string) {
    const code = Math.floor(100000 + Math.random() * 900000);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirm your email',
      template: './confirmation',
      context: {
        name,
        code,
      },
    });
  }
}
