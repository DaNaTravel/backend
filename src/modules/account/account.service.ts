import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { Account, AccountDocument } from 'src/schemas/accounts';
import { compareHash, hashPassword } from 'src/utils/auth';
import {
  AccountCreateDto,
  GoogleAccountDto,
  SignInDto,
  FacebookAccountDto,
  AccountUpdateDto,
  PasswordDto,
} from './dto';
import { TokenService } from './token.service';
import { generate } from 'generate-password';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountRepo: Model<AccountDocument>,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  async checkExistEmail(email: string) {
    const account = await this.accountRepo.findOne({ email }).lean();
    return Boolean(account);
  }

  async getAccountbyEmail(email: string) {
    const account = await this.accountRepo.findOne({ email, isConfirmed: true }).lean();
    return account;
  }

  async createAccount(account: AccountCreateDto) {
    const { password, ...data } = account;
    const passwordHash = hashPassword(password);

    const newAccount = await new this.accountRepo({
      ...data,
      phone: null,
      isActive: true,
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

  async validateFacebookAccount(account: FacebookAccountDto) {
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

  async resetPassWord(email: string) {
    const newPassword = Math.random().toString(36).slice(-8);
    const passwordHash = hashPassword(newPassword);
    await this.accountRepo.findOneAndUpdate({ email }, { password: passwordHash }, { new: true }).lean();

    return newPassword;
  }

  async getProfile(id: string) {
    const profile = await this.accountRepo
      .findById(id)
      .select('-__v -updatedAt -createdAt -password -isConfirmed -role ');
    return profile;
  }

  async updatedProfile(id: string, changedInfo: AccountUpdateDto) {
    const updatedProfile = await this.accountRepo
      .findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { ...changedInfo }, { new: true })
      .select('-__v -updatedAt -createdAt -password -isConfirmed -role ');
    console.log(updatedProfile);
    return updatedProfile;
  }

  async changePassword(id: string, data: PasswordDto) {
    const account = await this.accountRepo.findById(id);
    const isCorrect = compareHash(data.currentPassword, account.password);
    if (isCorrect) {
      if (data.currentPassword == data.newPassword)
        return [false, 'New password must be different from the old password'];
      else if (data.newPassword === data.confirmPassword) {
        const password = hashPassword(data.confirmPassword);
        await this.accountRepo.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { password }, { new: true });
        return [true];
      } else return [false, 'Password not match'];
    } else return [false, 'Password incorrect'];
  }

  async blockAccount(blockedId: ObjectId) {
    const blockedAccount = await this.accountRepo.findByIdAndUpdate(blockedId, { isActive: false }, { new: true });
    return blockedAccount;
  }

  // async getDataDashboard() {}
}
