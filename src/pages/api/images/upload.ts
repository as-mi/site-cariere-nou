import { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";

import nextConnect from "next-connect";

import multer from "multer";
import sharp from "sharp";

import { Role } from "@prisma/client";
import { authOptions } from "~/lib/next-auth-options";
import prisma from "~/lib/prisma";

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg"]);

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const apiRoute = nextConnect<NextApiRequestWithFile, NextApiResponse>({
  onNoMatch(_req, res) {
    res.status(405).json({ error: "invalid-method" });
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: 1 * 1024 * 1024,
  },
});

apiRoute.use(upload.single("file"));

apiRoute.all(async (req: NextApiRequestWithFile, res) => {
  if (req.method !== "POST" && req.method !== "PUT") {
    res.status(405).json({ error: "method-not-supported" });
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

  const { file } = req;

  if (!file) {
    res.status(400).json({
      error: "missing-file",
      message: "file object not found in request",
    });

    return;
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype.trim())) {
    res.status(400).json({
      error: "invalid-mime-type",
      message: "file does not have a valid image content type",
    });

    return;
  }

  let width, height;
  try {
    let metadata = await sharp(file.buffer).metadata();
    width = metadata.width;
    height = metadata.height;
  } catch (e) {
    console.error("Failed to read image dimensions using `sharp`: %o", e);
  }

  if (!width || !height) {
    res.status(400).json({
      error: "invalid-image",
      message: "could not read with and height from image",
    });

    return;
  }

  const data = {
    fileName: file.originalname,
    contentType: file.mimetype,
    width,
    height,
    data: file.buffer,
  };

  if (req.method === "POST") {
    const image = await prisma.image.create({ data });

    res.status(200).json({ id: image.id });
  } else {
    const id = req.body.id;

    if (!id) {
      res.status(400).json({
        error: "missing-id",
        message: "request is missing ID of image to replace",
      });
      return;
    }

    if (typeof id !== "string") {
      res.status(400).json({ error: "invalid-id" });
      return;
    }

    const imageId = parseInt(id);
    if (Number.isNaN(imageId)) {
      res.status(400).json({ error: "invalid-id" });
      return;
    }

    await prisma.image.update({
      where: {
        id: imageId,
      },
      data,
    });

    res.status(200).end("OK");
  }
});

export default apiRoute;

export const config = {
  api: {
    // Disable Next.js' built-in body parser, we want to process the raw stream
    bodyParser: false,
  },
};
