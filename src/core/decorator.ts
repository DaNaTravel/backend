import { ExecutionContext, SetMetadata, createParamDecorator } from '@nestjs/common';
import { Role } from 'src/utils';

export const Roles = (...roles: number[]) => SetMetadata('roles', roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export type Auth = { _id: string; role: Role };

export const GetAuth = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const ctx = context.switchToHttp().getRequest();
  return ctx.user as Auth;
});
