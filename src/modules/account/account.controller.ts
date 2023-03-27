import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'src/utils';
import { AccountService } from './account.service';
import { GoogleAuthGuard, FacebookAuthGuard } from '../../guards/google.guard';
import { RefreshAuthGuard } from 'src/guards/refresh.guard';
import {
  AccountCreateDto,
  GoogleAccountDto,
  SignInDto,
  FacebookAccountDto,
} from './dto';
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

  @Get('/facebook')
  @UseGuards(FacebookAuthGuard)
  async signInByFacebook() {}

  @Get('/facebook-redirect')
  @UseGuards(FacebookAuthGuard)
  async facebookLoginRedirect(@Req() request: Request) {
    const account = request.user as FacebookAccountDto;
    if (account) {
      const data = await this.accountService.validateFacebookAccount(account);
      return {
        message: null,
        data: data,
      };
    } else
      throw new UnauthorizedException({
        message: 'Facebook account is invalid',
        data: null,
      });
  }
}
