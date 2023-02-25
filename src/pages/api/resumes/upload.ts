import { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";

import nextConnect from "next-connect";

import multer from "multer";

import { Role } from "@prisma/client";
import { authOptions } from "~/lib/next-auth-options";
import prisma from "~/lib/prisma";

const MAXIMUM_RESUME_SIZE_IN_BYTES = 2 * 1024 * 1024;
const MAXIMUM_NUMBER_OF_RESUMES_PER_PARTICIPANT = 5;

const ALLOWED_RESUME_MIME_TYPES = new Set(["application/pdf"]);

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
    fileSize: MAXIMUM_RESUME_SIZE_IN_BYTES,
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req: NextApiRequestWithFile, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    res.status(401).json({ error: "not-authenticated" });
    return;
  }

  const userId = session.user.id;

  if (session.user.role !== Role.PARTICIPANT) {
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

  if (file.size > MAXIMUM_RESUME_SIZE_IN_BYTES) {
    res.status(400).json({
      error: "file-too-big",
      message: "file size exceeds limit",
    });

    return;
  }

  if (!ALLOWED_RESUME_MIME_TYPES.has(file.mimetype.trim())) {
    res.status(400).json({
      error: "invalid-mime-type",
      message: "file does not have a valid content type",
    });

    return;
  }

  const resumeCount = await prisma.resume.count({
    where: { userId },
  });

  if (resumeCount >= MAXIMUM_NUMBER_OF_RESUMES_PER_PARTICIPANT) {
    res.status(400).json({
      error: "resumes-limit-reached",
      message: "reached limit on number of resumes",
    });

    return;
  }

  await prisma.resume.create({
    data: {
      userId,
      fileName: file.originalname,
      contentType: file.mimetype,
      data: file.buffer,
    },
  });

  res.status(200).end();
});

export default apiRoute;

export const config = {
  api: {
    // Disable Next.js' built-in body parser, we want to process the raw stream
    bodyParser: false,
  },
};
