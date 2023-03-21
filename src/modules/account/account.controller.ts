import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Role } from 'src/utils';
import { AccountService } from './account.service';
import { AccountCreateDto } from './dto';

@Controller('/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async createNewUser(@Body() account: AccountCreateDto) {
    const { email, role } = account;

    if (role === Role.ADMIN)
      throw new BadRequestException({
        message: 'Role is invalid',
        data: null,
      });

    const isExistEmail = await this.accountService.checkExistEmail(email);
    if (isExistEmail)
      throw new BadRequestException({
        error: 'Email is existed',
        data: null,
      });

    const newAccount = await this.accountService.createAccount(account);

    return {
      message: null,
      data: newAccount,
    };
  }
}
