import { NextApiRequest, NextApiResponse } from "next";

import {
  BadRequestError,
  MethodNotAllowedError,
  NotFoundError,
} from "~/api/errors";
import { createHandler } from "~/api/handler";
import { requireAdmin } from "~/api/auth";

import prisma from "~/lib/prisma";

const getImage = async (req: NextApiRequest, res: NextApiResponse) => {
  if (typeof req.query.id !== "string") {
    throw new BadRequestError("invalid-parameter");
  }

  const id = parseInt(req.query.id);
  if (Number.isNaN(id)) {
    throw new BadRequestError("invalid-parameter");
  }

  const image = await prisma.image.findUnique({
    where: { id },
    select: { contentType: true, data: true },
  });

  if (!image) {
    throw new NotFoundError();
  }

  res.setHeader("Content-Type", image.contentType);
  res.setHeader("Content-Length", image.data.byteLength);

  res.send(image.data);
};

const deleteImageWithoutAuth = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (typeof req.query.id !== "string") {
    throw new BadRequestError();
  }

  const id = parseInt(req.query.id);
  if (Number.isNaN(id)) {
    throw new BadRequestError();
  }

  const image = await prisma.image.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!image) {
    throw new NotFoundError();
  }

  await prisma.image.delete({
    where: { id },
  });

  res.status(200);
};

const deleteImage = requireAdmin(deleteImageWithoutAuth);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return await getImage(req, res);
    case "DELETE":
      return await deleteImage(req, res);
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
