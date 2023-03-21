import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from 'src/schemas/accounts';
import { hashPassword } from 'src/utils';
import { UserCreateDto } from './dto';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    @InjectModel(Account.name)
    private readonly accountRepo: Model<AccountDocument>,
  ) {}

  async checkExistEmail(email: string) {
    const account = await this.accountRepo.findOne({ email }).lean();

    return Boolean(account);
  }

  async createAccount(account: UserCreateDto) {
    this.logger.log(`Create new user: ${JSON.stringify(account)}`);

    const { password, ...data } = account;
    const passwordHash = hashPassword(password);

    const newAccount = await new this.accountRepo({
      ...data,
      password: passwordHash,
    }).save();

    return { _id: newAccount._id, role: newAccount.role };
  }
}
