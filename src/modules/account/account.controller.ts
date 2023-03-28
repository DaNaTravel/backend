import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'src/utils';
import { AccountService } from './account.service';
import { GoogleAuthGuard } from '../../guards/google.guard';
import { RefreshAuthGuard } from 'src/guards/refresh.guard';
import { AccountCreateDto, EmailConfirmationDto, GoogleAccountDto, SignInDto } from './dto';
import { MailService } from '../mail/mail.service';

@Controller('/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService, private readonly mailService: MailService) {}

  @Post()
  async createNewUser(@Body() account: AccountCreateDto) {
    const { email, role, name } = account;

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
    await this.mailService.sendEmailConfirm(email, newAccount._id);

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

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  async signInByGoogle() {}

  @Get('/google-redirect')
  @UseGuards(GoogleAuthGuard)
  async redirect(@Req() request: Request) {
    const account = request.user as GoogleAccountDto;
    if (account) {
      const data = await this.accountService.validateGoogleAccount(account);

      return {
        message: null,
        data: data,
      };
    } else
      throw new UnauthorizedException({
        message: 'Google account is invalid',
        data: null,
      });
  }

  @Get('/email-confirmations')
  async confirmEmail(@Query() emailConfirmation: EmailConfirmationDto) {
    const { email, context } = emailConfirmation;

    const isConfirmed = await this.accountService.checkConfirmedEmail(email);
    if (isConfirmed) throw new BadRequestException({ message: 'Email is confirmed', data: null });

    const verify = await this.mailService.verifyConfirmToken(context);

    if (verify === false) {
      throw new BadRequestException({
        message: 'Confirm email failed',
        data: null,
      });
    }

    const emailUpdated = await this.accountService.updateConfirmEmail(email);

    return {
      message: 'Email is confirmed',
      data: emailUpdated,
    };
  }
}
