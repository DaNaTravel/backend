import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Account, AccountDocument } from 'src/schemas/accounts';
import { compareHash, hashPassword } from 'src/utils/auth';
import { AccountCreateDto, SignInDto } from './dto';
import { TokenService } from './token.service';
import { EmailVerification } from '../account/interfaces/emailverifacation.interface';
import { ForgottenPassword } from './interfaces/forgottenpassword.interface';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { PORT, HOST } from 'src/constants';
import { async } from 'rxjs/dist/types';
@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    @InjectModel(Account.name)
    private readonly accountRepo: Model<AccountDocument>,
    private readonly tokenService: TokenService,
    @InjectModel('EmailVerification')
    private readonly emailVerificationModel: Model<EmailVerification>,
    @InjectModel('ForgottenPassword')
    private readonly forgottenPasswordModel: Model<ForgottenPassword>,
  ) {}

  async checkExistEmail(email: string) {
    const account = await this.accountRepo.findOne({ email }).lean();

    return Boolean(account);
  }

  async createAccount(account: AccountCreateDto) {
    this.logger.log(`Create new user: ${JSON.stringify(account)}`);

    const { password, ...data } = account;
    const passwordHash = hashPassword(password);

    const newAccount = await new this.accountRepo({
      ...data,
      password: passwordHash,
    }).save();

    return { _id: newAccount._id, role: newAccount.role };
  }

  async validateAccount(account: SignInDto) {
    this.logger.log(`Validate user: ${JSON.stringify(account)}`);

    const existedEmail = await this.accountRepo
      .findOne({ email: account.email })
      .lean();

    if (existedEmail) {
      const { password, ...data } = existedEmail;
      const isCorrect = compareHash(account.password, password);

      if (isCorrect) {
        const payload = { _id: data._id, role: data.role };

        const { token, refreshToken } = await this.tokenService.generateToken(
          payload,
        );

        return { _id: data._id, token: token, refreshToken: refreshToken };
      }
    }

    return null;
  }

  async refreshToken(account: any) {
    const { _id, role } = account;

    const isExistAccount = await this.accountRepo.findOne({ _id }).lean();

    if (isExistAccount) {
      const payload = { _id, role };

      const { token, refreshToken } = await this.tokenService.generateToken(
        payload,
      );

      return { _id, token, refreshToken };
    }
  }

  async createForgottenPasswordToken(email: string) {
    const forgottenPassword = await this.forgottenPasswordModel.findOne({
      email: email,
    });
    if (
      forgottenPassword &&
      (new Date().getTime() - forgottenPassword.timestamp.getTime()) / 60000 <
        15
    ) {
      throw new HttpException(
        'RESET_PASSWORD.EMAIL_SENT_RECENTLY',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      const forgottenPasswordModel =
        await this.forgottenPasswordModel.findOneAndUpdate(
          { email: email },
          {
            email: email,
            newPasswordToken: (
              Math.floor(Math.random() * 9000000) + 1000000
            ).toString(), //Generate 7 digits number,
            timestamp: new Date(),
          },
          { upsert: true, new: true },
        );
      if (forgottenPasswordModel) {
        return forgottenPasswordModel;
      } else {
        throw new HttpException(
          'LOGIN.ERROR.GENERIC_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async sendEmailForgotPassword(email: string) {
    const userEmail = await this.checkExistEmail(email);
    if (!userEmail) return null;

    const tokenModel = await this.createForgottenPasswordToken(email);
    if (tokenModel && tokenModel.newPasswordToken) {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const mailOptions = {
        from: '"Company" <' + testAccount.user + '>',
        to: email,
        subject: 'Frogotten Password',
        text: 'Forgot Password',
        html:
          'Hi! <br><br> If you requested to reset your password<br><br>' +
          '<a href=' +
          HOST +
          ':' +
          PORT +
          '/auth/email/reset-password/' +
          tokenModel.newPasswordToken +
          '>Click here</a>', // html body
      };

      const sent = await new Promise<boolean>(async function (resolve, reject) {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Message sent: %s', error);
            return reject(false);
          }
          console.log('Message sent: %s', info.messageId);
          resolve(true);
        });
      });

      return sent;
    } else {
      throw new HttpException(
        'REGISTER.USER_NOT_REGiSTERD',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
