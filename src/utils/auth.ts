import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

export const hashPassword = (password: string, salt = 10) => {
  return hashSync(password, genSaltSync(salt));
};

export const compareHash = (password: string, passwordHash: string) => {
  return compareSync(password, passwordHash);
};
