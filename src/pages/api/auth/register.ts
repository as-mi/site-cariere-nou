import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { Role } from "@prisma/client";
import prisma from "~/lib/prisma";

import { generateEmailVerificationToken, hashPassword } from "~/lib/accounts";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, mustHaveAlpha, mustHaveDigit } from "~/lib/passwords";

import { sendVerificationEmail } from "~/lib/emails";

import { createHandler } from "~/api/handler";
import {
  BadRequestError,
  InternalServerError,
  MethodNotAllowedError,
} from "~/api/errors";


const validatePassword = (password: string) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new BadRequestError(
      "password-too-short",
      `password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    );
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new BadRequestError(
      "password-too-long",
      `password must be at most ${MAX_PASSWORD_LENGTH} characters long`
    );
  }
  if(!mustHaveAlpha(password)) {
    throw new BadRequestError(
      "password-no-alpha",
      "password must contain at least one letter"
    );
  }
  if(!mustHaveDigit(password)) {
    throw new BadRequestError(
      "password-no-digit",
      "password must contain at least one digit"
    );
  }
}

const registerSchema = z
  .object({
    name: z.string().trim(),
    email: z.string().trim(),
    password: z.string(),
    language: z.enum(["ro", "en"]).default("ro"),
  })
  .strict();

type RegisterData = z.infer<typeof registerSchema>;

const register = async (data: RegisterData) => {
  validatePassword(data.password);

  try {
    const user = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (user) {
      throw new BadRequestError(
        "user-exists",
        "another user with the same e-mail has already been registered"
      );
    }
  } catch {
    throw new InternalServerError(
      "user-lookup-failed",
      "failed to check if another user exists with same e-mail"
    );
  }

  const emailVerificationToken = generateEmailVerificationToken();
  const passwordHash = await hashPassword(data.password);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        emailVerificationToken,
        passwordHash,
        role: Role.PARTICIPANT,
      },
    });
  } catch {
    throw new InternalServerError(
      "user-create-failed",
      "failed to create new user"
    );
  }

  try {
    await sendVerificationEmail(user, data.language, emailVerificationToken);

    console.log("Verification e-mail was sent successfully");
  } catch (e) {
    console.error("Failed to send verification e-mail: %o", e);

    console.log("Rolling back user creation");
    try {
      await prisma.user.delete({ where: { id: user.id } });
    } catch {
      console.error("Failed to delete user with ID `%d`", user.id);
    }

    throw new InternalServerError(
      "email-sending-failed",
      "failed to send e-mail message"
    );
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    throw new MethodNotAllowedError();
  }

  const parseResult = registerSchema.safeParse(req.body);

  if (!parseResult.success) {
    throw new BadRequestError();
  }

  const data = parseResult.data;

  await register(data);

  res.status(201).end();
}

export default createHandler(handler);
