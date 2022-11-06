import { genSalt, hash, compare } from 'bcrypt';

export const encryptPassword = async (password: string): Promise<string> => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};

export const comparePassword = async (
  password: string,
  encrypted: string
): Promise<boolean> => {
  return await compare(password, encrypted);
};
