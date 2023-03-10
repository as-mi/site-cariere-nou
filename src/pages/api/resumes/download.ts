import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import fs from "fs";
import os from "os";
import AdmZip from "adm-zip";

import { createHandler } from "~/api/handler";
import {
  BadRequestError,
  MethodNotAllowedError,
  NotFoundError,
} from "~/api/errors";

import prisma from "~/lib/prisma";

const downloadSchema = z
  .object({
    positionId: z.preprocess(
      (value) => parseInt(z.string().parse(value), 10),
      z.number().int()
    ),
  })
  .strict();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    throw new MethodNotAllowedError();
  }

  const parseResult = downloadSchema.safeParse(req.query);

  if (!parseResult.success) {
    throw new BadRequestError(
      "invalid-params",
      `Request query string is invalid: ${parseResult.error.toString()}`
    );
  }

  const { positionId } = parseResult.data;

  const position = await prisma.position.findUnique({
    where: { id: positionId },
  });

  if (!position) {
    throw new NotFoundError();
  }

  const tmpdir = os.tmpdir();
  const zipPath = `${tmpdir}/resumes_export-position_${positionId}.zip`;

  {
    const zip = new AdmZip();
    await zip.writeZipPromise(zipPath, { overwrite: true });
  }

  const BATCH_SIZE = 5;

  const resumeWhere = {
    where: {
      applications: {
        some: {
          positionId,
        },
      },
    },
  };
  const total = await prisma.resume.count({ ...resumeWhere });
  let skip = 0;

  while (skip < total) {
    // Reopen the zip file
    const zip = new AdmZip(zipPath, { readEntries: false });

    const resumes = await prisma.resume.findMany({
      ...resumeWhere,
      select: {
        userId: true,
        fileName: true,
        data: true,
      },
      skip,
      take: BATCH_SIZE,
    });

    console.log("Adding %d resumes to zip file", resumes.length);

    resumes.forEach((resume) => {
      zip.addFile(`${resume.userId}-${resume.fileName}`, resume.data);
    });

    zip.writeZip();

    skip += BATCH_SIZE;
  }

  const { size } = fs.statSync(zipPath);
  console.log(`Created zip file of size equal to ${size} bytes`);

  res.status(200);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Length", size);
  const downloadedFileName = `resumes_for_position_${positionId}.zip`;
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${downloadedFileName}`
  );

  res.on("close", () => {
    fs.rmSync(zipPath);
  });

  const zipReadStream = fs.createReadStream(zipPath);

  await new Promise(function (resolve) {
    zipReadStream.pipe(res);

    zipReadStream.on("end", resolve);
  });
}

export default createHandler(handler);

export const config = {
  api: {
    // We don't want to set a response limit,
    // since the generated zip file could end up being very large
    responseLimit: false,
  },
};
