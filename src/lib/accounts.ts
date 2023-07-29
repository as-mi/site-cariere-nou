import bcrypt from "bcrypt";
import crypto from "crypto";

import { User } from "@prisma/client";

import { BadRequestError } from "~/api/errors";

import prisma from "./prisma";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  mustHaveAlpha,
  mustHaveDigit,
} from "./passwords";

const BCRYPT_NUM_ROUNDS = 10;

/**
 * Checks that the given password satisfies the minimum security requirements.
 */
export const validatePassword = (password: string): void => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new BadRequestError(
      "password-too-short",
      `password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    );
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new BadRequestError(
      "password-too-long",
      `password must be at most ${MAX_PASSWORD_LENGTH} characters long`,
    );
  }
  if (!mustHaveAlpha(password)) {
    throw new BadRequestError(
      "password-no-alpha",
      "password must contain at least one letter",
    );
  }
  if (!mustHaveDigit(password)) {
    throw new BadRequestError(
      "password-no-digit",
      "password must contain at least one digit",
    );
  }
};

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
  password: string,
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
