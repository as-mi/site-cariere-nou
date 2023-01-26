import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import bcrypt from "bcrypt";

import prisma from "../../../lib/prisma";

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

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_NUM_ROUNDS);

  try {
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
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

  res.status(200).send("OK");
}
