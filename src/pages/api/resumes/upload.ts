import { NextApiRequest, NextApiResponse } from "next";

import nextConnect from "next-connect";

import multer from "multer";

import { Role } from "@prisma/client";

import { createHandler } from "~/api/handler";
import {
  BadRequestError,
  NotAuthenticatedError,
  NotAuthorizedError,
} from "~/api/errors";

import { getServerSession } from "~/lib/auth";
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

const uploadResume = async (
  req: NextApiRequestWithFile,
  res: NextApiResponse
) => {
  const session = await getServerSession(req, res);

  if (!session?.user) {
    throw new NotAuthenticatedError();
  }

  const userId = session.user.id;

  if (session.user.role !== Role.PARTICIPANT) {
    throw new NotAuthorizedError();
  }

  const { file } = req;

  if (!file) {
    throw new BadRequestError(
      "missing-file",
      "file object not found in request"
    );
  }

  if (file.size > MAXIMUM_RESUME_SIZE_IN_BYTES) {
    throw new BadRequestError("file-too-big", "file size exceeds limit");
  }

  if (!ALLOWED_RESUME_MIME_TYPES.has(file.mimetype.trim())) {
    throw new BadRequestError(
      "invalid-mime-type",
      "file does not have a valid content type"
    );
  }

  const resumeCount = await prisma.resume.count({
    where: { userId },
  });

  if (resumeCount >= MAXIMUM_NUMBER_OF_RESUMES_PER_PARTICIPANT) {
    throw new BadRequestError(
      "resumes-limit-reached",
      "reached limit on number of resumes"
    );
  }

  const resume = await prisma.resume.create({
    data: {
      userId,
      fileName: file.originalname,
      contentType: file.mimetype,
      data: file.buffer,
    },
    select: {
      id: true,
    },
  });

  // Prevent multiple uploads going over the limit due to request concurrency
  const newResumeCount = await prisma.resume.count({
    where: { userId },
  });
  if (newResumeCount !== resumeCount + 1) {
    await prisma.resume.delete({ where: { id: resume.id } });

    throw new BadRequestError(
      "resumes-limit-reached",
      "reached limit on number of resumes"
    );
  }
};

apiRoute.use(upload.single("file"));

apiRoute.post(uploadResume);

export default createHandler(apiRoute);

export const config = {
  api: {
    // Disable Next.js' built-in body parser, we want to process the raw stream
    bodyParser: false,
  },
};
