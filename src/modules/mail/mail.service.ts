import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId, Types } from 'mongoose';
import { CONFIRM_EXPIRES_IN, JWT_CONFIRM_SECRET_KEY } from 'src/constants';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService, private readonly jwtService: JwtService) {}

  async generateConfirmToken(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: CONFIRM_EXPIRES_IN + `m`,
      secret: JWT_CONFIRM_SECRET_KEY,
    });

    return accessToken;
  }

  async verifyConfirmToken(token: string) {
    const payload = this.jwtService.verify(token, { secret: JWT_CONFIRM_SECRET_KEY });

    if (typeof payload === 'object' && '_id' in payload) {
      return true;
    }

    return false;
  }

  async sendEmailConfirm(email: string, _id: string | Types.ObjectId) {
    const payload = { email, _id };
    const token = await this.generateConfirmToken(payload);

    const url = `http://localhost:5000/accounts/email-confirmations?context=${token}&email=${email}`;

    const info = await this.mailerService.sendMail({
      from: 'danatravel.od2t@gmail.com',
      to: email,
      subject: 'DaNaTravel - Confirm your email',
      text: `Welcome to our application. To confirm your email, please click here ${url}`,
    });

    return info;
  }
}
