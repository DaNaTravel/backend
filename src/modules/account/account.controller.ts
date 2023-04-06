import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Param,
  UnauthorizedException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'src/utils';
import { AccountService } from './account.service';
import { GoogleAuthGuard } from '../../guards/google.guard';
import { RefreshAuthGuard } from 'src/guards/refresh.guard';
import { AccountCreateDto, GoogleAccountDto, SignInDto, FacebookAccountDto, EmailConfirmationDto } from './dto';
import { FacebookAuthGuard } from 'src/guards/facebook.guard';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Controller('/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService, private readonly mailService: MailService) {}

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
    await this.mailService.sendEmailConfirm(email, newAccount._id);

    return {
      message: 'Please confirm your email',
      data: newAccount,
    };
  }

  @Post('/signin')
  async validateAccount(@Body() account: SignInDto) {
    const { email } = account;

    const isExistEmail = await this.accountService.checkConfirmedEmail(email);
    if (isExistEmail === false) {
      throw new NotFoundException({
        message: 'Email is not existed',
        data: null,
      });
    }

    const isConfirmed = await this.accountService.checkConfirmedEmail(email);

    if (Boolean(isConfirmed) === false)
      throw new BadRequestException({
        message: 'Please confirm your email before sign-in',
        data: null,
      });

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

  @Get('/refresh')
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
    };
  }

  @Post('/forgot-password')
  async sendEmailForgotPassword(@Body('email') email: string) {
    const isExisted = await this.accountService.checkExistEmail(email);

    if (isExisted === false) {
      throw new BadRequestException({ message: 'Email not found', data: null });
    }

    await this.mailService.sendEmailForgotPassword(email);

    return {
      message: 'System sent your email',
      data: email,
    };
  }

  @Get('/reset-password')
  async resetPassword(@Query('email') email: string) {
    const newPassword = await this.accountService.resetPassWord(email);
    if (newPassword !== null) {
      await this.mailService.sendEmailResetPassword(email, newPassword);
      return {
        message: 'Reset password success',
        data: null,
      };
    }
    return {
      message: 'Reset assword error',
      data: null,
    };
  }
}
