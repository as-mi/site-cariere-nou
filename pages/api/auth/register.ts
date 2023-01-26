import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";

import prisma from "../../../lib/prisma";

import {
  convertHtmlToText,
  initI18n,
  Language,
  renderEmailToHtml,
} from "../../../lib/emails";
import VerifyEmail from "../../../emails/verify-email";

type SuccessResponse = "OK";

type ErrorResponse = {
  error: string;
  message: string;
  detail?: string;
};

type ResponseData = SuccessResponse | ErrorResponse;

const registerSchema = z
  .object({
    name: z.string().trim(),
    email: z.string().trim(),
    password: z.string(),
  })
  .strict();

const BCRYPT_NUM_ROUNDS = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    res.status(400).json({
      error: "invalid-method",
      message: "only POST requests are allowed",
    });
    return;
  }

  const parseResult = registerSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "invalid-payload",
      message: "failed to parse request body",
    });
    return;
  }

  let preferredLanguage: Language;
  switch (req.headers["Accept-Language"]) {
    case "en":
      preferredLanguage = "en";
    case "ro":
      preferredLanguage = "ro";
    default:
      preferredLanguage = "ro";
      break;
  }

  const data = parseResult.data;

  try {
    const user = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (user) {
      res.status(400).json({
        error: "user-exists",
        message:
          "another user with the same e-mail has already been registered",
      });
      return;
    }
  } catch {
    res.status(500).json({
      error: "user-lookup-failed",
      message: "failed to check if another user exists with same e-mail",
    });
    return;
  }

  // Generate a random token for verifying the ownership of the e-mail address
  const emailVerificationToken = crypto.randomBytes(16).toString("hex");

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_NUM_ROUNDS);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        emailVerificationToken,
        passwordHash,
        role: "PARTICIPANT",
      },
    });
  } catch {
    res.status(500).json({
      error: "user-create-failed",
      message: "failed to create new user",
    });
    return;
  }

  console.log("Sending a verification e-mail to `%s`", data.email);

  const options = process.env.EMAIL_CONNECTION_STRING;

  const transporter = nodemailer.createTransport(options);

  const from = process.env.EMAIL_FROM;
  const to = data.email;

  const i18n = await initI18n(preferredLanguage);

  const subject = i18n.t("verifyEmail.subject", { ns: "emails" });

  const baseUrl = process.env.NEXTAUTH_URL;
  const verifyUrl = `${baseUrl}/auth/verify-email?id=${user.id}&token=${emailVerificationToken}`;
  const props = { name: data.name, verifyUrl };
  const html = await renderEmailToHtml(VerifyEmail, props, i18n);
  const text = convertHtmlToText(html);

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  if (info.accepted.length < 1) {
    console.error("Failed to send verification e-mail: %o", info);

    console.log("Rolling back user creation");
    try {
      await prisma.user.delete({ where: { id: user.id } });
    } catch {
      console.error("Failed to delete user with ID `%d`", user.id);
    }

    res.status(500).json({
      error: "email-sending-failed",
      message: "failed to send e-mail message",
    });
    return;
  }

  res.status(200).send("OK");
}
