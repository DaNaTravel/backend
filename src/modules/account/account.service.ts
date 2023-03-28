import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from 'src/schemas/accounts';
import { compareHash, hashPassword } from 'src/utils/auth';
import { AccountCreateDto, GoogleAccountDto, SignInDto } from './dto';
import { TokenService } from './token.service';
import { generate } from 'generate-password';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountRepo: Model<AccountDocument>,
    private readonly tokenService: TokenService,
  ) {}

  async checkExistEmail(email: string) {
    const account = await this.accountRepo.findOne({ email }).lean();

    return Boolean(account);
  }

  async createAccount(account: AccountCreateDto) {
    const { password, ...data } = account;
    const passwordHash = hashPassword(password);

    const newAccount = await new this.accountRepo({
      ...data,
      password: passwordHash,
    }).save();

    return { _id: newAccount._id, role: newAccount.role };
  }

  async validateAccount(account: SignInDto) {
    const existedEmail = await this.accountRepo.findOne({ email: account.email }).lean();

    if (existedEmail) {
      const { password, ...data } = existedEmail;
      const isCorrect = compareHash(account.password, password);

      if (isCorrect) {
        const payload = { _id: data._id, role: data.role };

        const { token, refreshToken } = await this.tokenService.generateToken(payload);

        return {
          _id: data._id,
          token: token,
          refreshToken: refreshToken,
        };
      }
    }

    return null;
  }

  async refreshToken(account: any) {
    const { _id, role } = account;

    const isExistAccount = await this.accountRepo.findOne({ _id }).lean();

    if (isExistAccount) {
      const payload = { _id, role };

      const { token, refreshToken } = await this.tokenService.generateToken(payload);

      return { _id, token, refreshToken };
    }
  }

  async validateGoogleAccount(account: GoogleAccountDto) {
    const existedEmail = await this.accountRepo.findOne({ email: account.email }).lean();
    let payload: any = {};

    if (existedEmail) {
      payload = { _id: existedEmail._id, role: existedEmail.role };
    } else {
      const password = generate({
        length: 15,
        numbers: true,
        symbols: true,
      });

      const passwordHash = hashPassword(password);
      const newAccount = await new this.accountRepo({
        ...account,
        password: passwordHash,
      }).save();

      payload = { _id: newAccount._id, role: newAccount.role };
    }

    const { token, refreshToken } = await this.tokenService.generateToken(payload);

    return {
      _id: payload._id,
      token: token,
      refreshToken: refreshToken,
    };
  }

  async checkConfirmedEmail(email: string) {
    const account = await this.accountRepo.findOne({ email }).lean();

    return account.isConfirmed;
  }

  async updateConfirmEmail(email: string) {
    const account = await this.accountRepo.findOneAndUpdate({ email }, { isConfirmed: true }, { new: true }).lean();

    return { _id: account._id, email: account._id, isConfirmed: account.isConfirmed };
  }
}
