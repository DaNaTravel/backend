import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

export enum Role {
  ADMIN,
  OWNER,
  TRAVELER,
}

export const hashPassword = (password: string, salt = 10) => {
  return hashSync(password, genSaltSync(salt));
};
