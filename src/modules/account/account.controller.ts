import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Param,
  Patch,
  UnauthorizedException,
  NotFoundException,
  Query,
  Delete,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { Role } from 'src/utils';
import { AccountService } from './account.service';
import { GoogleAuthGuard } from '../../guards/google.guard';
import { RefreshAuthGuard } from 'src/guards/refresh.guard';
import {
  AccountCreateDto,
  GoogleAccountDto,
  SignInDto,
  FacebookAccountDto,
  EmailConfirmationDto,
  AccountUpdateDto,
  PasswordDto,
  DeletedAccountBodyDto,
  AccountQueryDto,
} from './dto';
import { FacebookAuthGuard } from 'src/guards/facebook.guard';
import { MailService } from '../mail/mail.service';
import { TokenService } from './token.service';
import { Auth, GetAuth } from 'src/core/decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { ObjectId } from 'mongoose';
import { PATH_CONTAIN_ID } from 'src/constants';

@Controller('/accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  @Post()
  async registerNewUser(@Body() account: AccountCreateDto) {
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

    const newAccount = await this.accountService.registerAccount(account);
    await this.mailService.sendEmailConfirm(email, newAccount._id);

    return {
      message: 'Please confirm your email',
      data: newAccount,
    };
  }

  @Post('/signin')
  async validateAccount(@Body() account: SignInDto) {
    const { email } = account;

    const isExistEmail = await this.accountService.checkExistEmail(email);
    if (isExistEmail === false) {
      throw new NotFoundException({
        message: 'Email is not existed',
        data: null,
      });
    }

    const isConfirmed = await this.accountService.checkConfirmedEmail(email);

    if (isConfirmed === false)
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
    await this.accountService.updateConfirmEmail(email);

    return {
      message: 'Email is confirmed',
    };
  }

  @Post('/forgot-password')
  async sendEmailForgotPassword(@Body('email') email: string) {
    const user = await this.accountService.getAccountbyEmail(email);
    if (!user) {
      throw new BadRequestException({ message: 'Email not found', data: null });
    }
    const code = uuidv4();
    const token = await this.tokenService.createToken(code);
    await this.mailService.sendEmailForgotPassword(email, token);
    return {
      message: 'System sent your email',
      data: email,
    };
  }

  @Get('/reset-password')
  async resetPassword(@Query('email') email: string, @Query('token') token: string) {
    const payload = await this.tokenService.verifyToken(token);
    const { code } = payload;

    const isExist = await this.tokenService.findToken(code);
    if (isExist === false) throw new UnauthorizedException('Token is invalid');

    const newPassword = await this.accountService.resetPassWord(email);
    if (newPassword !== null) {
      await Promise.all([
        this.mailService.sendEmailResetPassword(email, newPassword),
        this.tokenService.deleteToken(code),
      ]);

      return {
        message: 'Reset password success',
        data: email,
      };
    }
    return {
      message: 'Reset assword error',
      data: null,
    };
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetAuth() auth: Auth) {
    const profile = await this.accountService.getProfile(auth._id);
    if (!profile) throw new BadRequestException('Bad Request');
    return {
      message: 'Success',
      data: profile,
    };
  }

  @Patch('/profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@GetAuth() auth: Auth, @Body() changedInfo: AccountUpdateDto) {
    if (!Object.keys(changedInfo).length) {
      throw new BadRequestException('No changes found');
    }
    const updatedProfile = await this.accountService.updatedProfile(auth._id, changedInfo);
    if (!updatedProfile) throw new BadRequestException('Bad Request');
    return {
      message: 'Success',
      data: updatedProfile,
    };
  }

  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@GetAuth() auth: Auth, @Body() data: PasswordDto) {
    const updatedInfo = await this.accountService.changePassword(auth._id, data);
    if (updatedInfo[0] === false) throw new BadRequestException(updatedInfo[1]);
    return {
      message: 'Success',
      data: null,
    };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteAccounts(@GetAuth() auth: Auth, @Body() body: DeletedAccountBodyDto) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission', data: null });
    const data = await this.accountService.deleteAccounts(body.deletedIds);
    if (!data) throw new BadRequestException('Bad Request');
    return {
      message: 'Success',
      data: data,
    };
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getListUsers(@GetAuth() auth: Auth, @Query() dto: AccountQueryDto) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission', data: null });
    const data = await this.accountService.getListUsers(dto);
    if (!data) throw new BadRequestException('Bad Request');
    return {
      message: 'Success',
      data: data,
    };
  }

  @Patch(`/admin/update/:accountId${PATH_CONTAIN_ID}`)
  @UseGuards(JwtAuthGuard)
  async updateProfileUser(
    @GetAuth() auth: Auth,
    @Param('accountId') accountId: ObjectId,
    @Body() changedInfo: AccountUpdateDto,
  ) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission', data: null });

    if (!Object.keys(changedInfo).length) {
      throw new BadRequestException('No changes found');
    }

    const updatedProfile = await this.accountService.updatedProfile(accountId, changedInfo);
    if (!updatedProfile) throw new BadRequestException('Bad Request');
    return {
      message: 'Success',
      data: updatedProfile,
    };
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createNewUser(@GetAuth() auth: Auth, @Body() account: AccountCreateDto) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission', data: null });

    const isExistEmail = await this.accountService.checkExistEmail(account.email);
    if (isExistEmail)
      throw new BadRequestException({
        message: 'Email is existed',
        data: null,
      });

    const newAccount = await this.accountService.createAccount(account);
    return {
      message: 'Success',
      data: newAccount,
    };
  }
}
