import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'src/utils';
import { AccountService } from './account.service';
import { RefreshAuthGuard } from 'src/guard/refresh.guard';
import { AccountCreateDto, SignInDto } from './dto';

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
        message: 'Email is existed',
        data: null,
      });

    const newAccount = await this.accountService.createAccount(account);

    return {
      message: null,
      data: newAccount,
    };
  }

  @Post('/signin')
  async validateAccount(@Body() account: SignInDto) {
    const output = await this.accountService.validateAccount(account);

    if (output === null)
      throw new BadRequestException({
        message: 'Account is invalid',
        data: null,
      });

    return {
      message: null,
      data: output,
    };
  }

  @Post('/refresh')
  @UseGuards(RefreshAuthGuard)
  async refreshToken(@Req() request: Request) {
    const account = request.user;
    const output = await this.accountService.refreshToken(account);

    if (output === null)
      throw new BadRequestException({
        message: 'Account is invalid',
        data: null,
      });

    return {
      message: null,
      data: output,
    };
  }
}
