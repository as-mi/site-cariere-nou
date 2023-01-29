import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import prisma from "~/lib/prisma";
import { hashPassword } from "~/lib/accounts";

type SuccessResponse = "OK";

type ErrorResponse = {
  error: string;
  message: string;
};

type ResponseData = SuccessResponse | ErrorResponse;

const setNewPasswordSchema = z
  .object({
    userId: z.number(),
    token: z.string().trim(),
    newPassword: z.string(),
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

  const parseResult = setNewPasswordSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "invalid-payload",
      message: "failed to parse request body",
    });
    return;
  }

  const data = parseResult.data;

  let user;
  try {
    user = await prisma.user.findFirst({
      where: { id: data.userId },
    });
  } catch {
    res.status(500).json({
      error: "user-lookup-failed",
      message: "failed to check if another user exists with same e-mail",
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

  // Encrypt the new password
  const newPasswordHash = await hashPassword(data.newPassword);

  try {
    // TODO: also invalidate password reset token
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });
  } catch {
    res.status(500).json({
      error: "user-create-failed",
      message: "failed to update user entity",
    });
  }

  res.status(200).send("OK");
}
