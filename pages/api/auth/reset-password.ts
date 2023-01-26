import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import crypto from "crypto";
import nodemailer from "nodemailer";

import prisma from "../../../lib/prisma";
import {
  convertHtmlToText,
  initI18n,
  Language,
  renderEmailToHtml,
} from "../../../lib/emails";
import ResetPasswordEmail from "../../../emails/reset-password";

type SuccessResponse = "OK";

type ErrorResponse = {
  error: string;
  message: string;
};

type ResponseData = SuccessResponse | ErrorResponse;

const resetPasswordSchema = z
  .object({
    email: z.string().trim(),
  })
  .strict();

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

  const parseResult = resetPasswordSchema.safeParse(req.body);

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

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email: data.email },
    });
  } catch {
    res.status(500).json({
      error: "user-lookup-failed",
      message: "failed to check if an user with this e-mail exists",
    });
    return;
  }

  if (!user) {
    res.status(404).json({
      error: "user-not-found",
      message: "no user with this e-mail could be found",
    });
    return;
  }

  let passwordResetToken;
  if (user.passwordResetToken) {
    passwordResetToken = user.passwordResetToken;
  } else {
    // Generate a random token for verifying the ownership of the e-mail address
    passwordResetToken = crypto.randomBytes(16).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken },
    });
  }

  console.log("Sending a password reset e-mail to `%s`", data.email);

  // TODO: refactor this block of code, it's the same as the one in `register.ts`
  const options = process.env.EMAIL_CONNECTION_STRING;

  const transporter = nodemailer.createTransport(options);

  const from = process.env.EMAIL_FROM;
  const to = data.email;

  const i18n = await initI18n(preferredLanguage);

  const subject = i18n.t("resetPassword.subject", { ns: "emails" });

  const baseUrl = process.env.NEXTAUTH_URL;
  const resetPasswordUrl = `${baseUrl}/auth/set-new-password?id=${user.id}&token=${passwordResetToken}`;
  const props = { name: user.name, resetPasswordUrl };
  const html = await renderEmailToHtml(ResetPasswordEmail, props, i18n);
  const text = convertHtmlToText(html);

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  if (info.accepted.length < 1) {
    console.error("Failed to send a password reset e-mail: %o", info);

    res.status(500).json({
      error: "email-sending-failed",
      message: "failed to send e-mail message",
    });
    return;
  }

  console.log("Password reset e-mail was sent successfully");

  res.status(200).send("OK");
}
