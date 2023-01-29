import bcrypt from "bcrypt";

import { User } from "@prisma/client";

import prisma from "./prisma";

const BCRYPT_NUM_ROUNDS = 10;

export const hashPassword = (plaintextPassword: string): Promise<string> =>
  bcrypt.hash(plaintextPassword, BCRYPT_NUM_ROUNDS);

export const authenticateUser = async (
  email: string,
  password: string
): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.passwordHash) {
    throw new Error("User doesn't have any password set");
  }

  const match = await bcrypt.compare(password, user.passwordHash);

  if (!match) {
    throw new Error("Password hash doesn't match");
  }

  return user;
};
