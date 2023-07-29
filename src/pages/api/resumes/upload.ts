import { NextApiRequest, NextApiResponse } from "next";

import nextConnect from "next-connect";

import multer from "multer";

import { Role } from "@prisma/client";

import { createHandler } from "~/api/handler";
import {
  BadRequestError,
  MethodNotAllowedError,
  NotAuthenticatedError,
  NotAuthorizedError,
  NotFoundError,
} from "~/api/errors";

import { getServerSession } from "~/lib/auth";
import prisma from "~/lib/prisma";
import { getSettingValue } from "~/lib/settings/get";

const MAXIMUM_RESUME_SIZE_IN_BYTES = 2 * 1024 * 1024;
const MAXIMUM_NUMBER_OF_RESUMES_PER_PARTICIPANT = 5;

const ALLOWED_RESUME_MIME_TYPES = new Set(["application/pdf"]);

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const apiRoute = nextConnect<NextApiRequestWithFile, NextApiResponse>();

function fixFileName(
  _req: unknown,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) {
  // Fix files having UTF-8 encoded names
  // Based on https://stackoverflow.com/a/72909626/5723188
  file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");

  callback(null, true);
}

const upload = multer({
  fileFilter: fixFileName,
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: MAXIMUM_RESUME_SIZE_IN_BYTES,
  },
});

const uploadResume = async (
  req: NextApiRequestWithFile,
  res: NextApiResponse,
) => {
  if (req.method !== "POST" && req.method !== "PUT") {
    throw new MethodNotAllowedError();
  }

  const applicationsEnabled = await getSettingValue("showAvailablePositions");
  if (req.method === "PUT" && !applicationsEnabled) {
    throw new MethodNotAllowedError(
      "method-not-allowed",
      "replacing resume is not allowed when applications are closed",
    );
  }

  const applicationsClosed = await getSettingValue("closeApplications");
  if (applicationsClosed) {
    throw new MethodNotAllowedError(
      "method-not-allowed",
      "application period has ended, resumes cannot be created or edited anymore",
    );
  }

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
      "file object not found in request",
    );
  }

  if (file.size > MAXIMUM_RESUME_SIZE_IN_BYTES) {
    throw new BadRequestError("file-too-big", "file size exceeds limit");
  }

  if (!ALLOWED_RESUME_MIME_TYPES.has(file.mimetype.trim())) {
    throw new BadRequestError(
      "invalid-mime-type",
      "file does not have a valid content type",
    );
  }

  const data = {
    userId,
    fileName: file.originalname,
    contentType: file.mimetype,
    data: file.buffer,
  };

  if (req.method === "POST") {
    const resumeCount = await prisma.resume.count({
      where: { userId },
    });

    if (resumeCount >= MAXIMUM_NUMBER_OF_RESUMES_PER_PARTICIPANT) {
      throw new BadRequestError(
        "resumes-limit-reached",
        "reached limit on number of resumes",
      );
    }

    const resume = await prisma.resume.create({
      data,
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
        "reached limit on number of resumes",
      );
    }
  } else if (req.method === "PUT") {
    const id = req.body.id;

    if (!id) {
      res.status(400).json({
        error: "missing-id",
        message: "request is missing ID of resume to replace",
      });
      return;
    }

    if (typeof id !== "string") {
      res.status(400).json({ error: "invalid-id" });
      return;
    }

    const resumeId = parseInt(id);
    if (Number.isNaN(resumeId)) {
      res.status(400).json({ error: "invalid-id" });
      return;
    }

    const resume = await prisma.resume.findFirst({
      where: {
        userId,
        id: resumeId,
      },
    });

    if (!resume) {
      throw new NotFoundError();
    }

    await prisma.resume.update({
      where: { id: resumeId },
      data,
    });
  }
};

apiRoute.use(upload.single("file"));

apiRoute.all(createHandler(uploadResume));

export default apiRoute;

export const config = {
  api: {
    // Disable Next.js' built-in body parser, we want to process the raw stream
    bodyParser: false,
  },
};
