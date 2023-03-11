import { NextApiRequest, NextApiResponse } from "next";

import {
  BadRequestError,
  MethodNotAllowedError,
  NotFoundError,
} from "~/api/errors";
import { createHandler } from "~/api/handler";
import { requireAdmin } from "~/api/auth";

import prisma from "~/lib/prisma";

const getResumeWithoutAdmin = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (typeof req.query.id !== "string") {
    throw new BadRequestError("invalid-parameter");
  }

  const id = parseInt(req.query.id);
  if (Number.isNaN(id)) {
    throw new BadRequestError("invalid-parameter");
  }

  const resume = await prisma.resume.findUnique({
    where: { id },
    select: { contentType: true, data: true },
  });

  if (!resume) {
    throw new NotFoundError();
  }

  res.setHeader("Content-Type", resume.contentType);
  res.setHeader("Content-Length", resume.data.byteLength);

  res.send(resume.data);
};

const getResume = requireAdmin(getResumeWithoutAdmin);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return await getResume(req, res);
    default:
      throw new MethodNotAllowedError();
  }
};

export default createHandler(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
