import { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";

import { Role } from "@prisma/client";

import prisma from "~/lib/prisma";
import { authOptions } from "~/lib/next-auth-options";

type SuccessResponse = {
  id: number;
  fileName: string;
}[];

type ErrorResponse = {
  error: string;
  message?: string;
};

type ResponseData = SuccessResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    res.status(400).json({
      error: "invalid-method",
      message: "only GET requests are allowed",
    });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    res.status(401).json({ error: "not-authenticated" });
    return;
  }

  if (session.user.role !== Role.ADMIN) {
    res.status(403).json({ error: "not-authorized" });
    return;
  }

  const images = await prisma.image.findMany({
    select: {
      id: true,
      fileName: true,
    },
  });

  res.status(200).json(images);
}
