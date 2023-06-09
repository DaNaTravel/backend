import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Pagination, Role } from 'src/utils';
import { AVATAR_DEFAULT } from '../../../constants';
import { ObjectId } from 'mongoose';
export class AccountCreateDto {
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*/, {
    message: 'Password must include at least 1 number and 1 character',
  })
  password: string;

  @IsString()
  @MaxLength(200)
  @Matches(/^(?=.{1,40}$)[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$/, {
    message: 'Name contains only alphabets',
  })
  name: string;

  @IsEnum(Role)
  role: Role = Role.TRAVELER;

  @IsOptional()
  @IsString()
  avatar: string = AVATAR_DEFAULT;
}
export class AccountUpdateDto {
  @IsMongoId()
  @IsOptional()
  accountId: ObjectId;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  @Matches(/^(?=.{1,40}$)[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$/, {
    message: 'Name contains only alphabets',
  })
  name: string;

  @IsOptional()
  @IsString()
  avatar: string = AVATAR_DEFAULT;

  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @IsOptional()
  isActive: boolean;

  @IsOptional()
  isConfirmed: boolean;
}

export class PasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*/, {
    message: 'Password must include at least 1 number and 1 character',
  })
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*/, {
    message: 'Password must include at least 1 number and 1 character',
  })
  newPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*/, {
    message: 'Password must include at least 1 number and 1 character',
  })
  confirmPassword: string;
}

export class SignInDto {
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*/, {
    message: 'Password must include at least 1 number and 1 character',
  })
  password: string;
}

export class GoogleAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsEnum(Role)
  role: Role = Role.TRAVELER;

  @IsOptional()
  @IsString()
  avatar: string = AVATAR_DEFAULT;
}

export class EmailConfirmationDto {
  @IsString()
  context: string;

  @IsString()
  email: string;
}

export class FacebookAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsEnum(Role)
  role: Role = Role.TRAVELER;

  @IsOptional()
  @IsString()
  avatar: string = AVATAR_DEFAULT;
}

export class BlockedAccountBodyDto {
  @IsMongoId()
  blockedId: ObjectId;
}

export class DeletedAccountBodyDto {
  @IsArray()
  deletedIds: ObjectId[];
}

export class AccountQueryDto extends Pagination {
  @IsOptional()
  keyword: string;
}
