import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/utils';

export class UserCreateDto {
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
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
}
