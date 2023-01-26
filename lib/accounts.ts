import bcrypt from "bcrypt";

import { User } from "@prisma/client";

import prisma from "./prisma";

type Credentials = {
  email: string;
  password: string;
};

export const authenticateUser = async (
  credentials: Credentials
): Promise<User> => {
  const email = credentials.email;

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.passwordHash) {
    throw new Error("User doesn't have any password set");
  }

  const match = await bcrypt.compare(credentials.password, user.passwordHash);

  if (!match) {
    throw new Error("Password hash doesn't match");
  }

  return user;
};
