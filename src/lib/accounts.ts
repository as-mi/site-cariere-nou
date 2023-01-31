import bcrypt from "bcrypt";
import crypto from "crypto";

import { User } from "@prisma/client";

import prisma from "./prisma";

const BCRYPT_NUM_ROUNDS = 10;

/**
 * Securely hashes a password using the {@link https://en.wikipedia.org/wiki/Bcrypt | bcrypt} algorithm.
 *
 * @param plaintextPassword the original unencrypted password
 * @returns a {@link Promise} for the password's hash, as a string
 */
export const hashPassword = (plaintextPassword: string): Promise<string> =>
  bcrypt.hash(plaintextPassword, BCRYPT_NUM_ROUNDS);

/**
 * Generates a random token for verifying the ownership of the e-mail address.
 */
export const generateEmailVerificationToken = (): string =>
  crypto.randomBytes(16).toString("hex");

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
