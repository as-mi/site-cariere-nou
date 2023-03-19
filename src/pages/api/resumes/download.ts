import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import fs from "fs";
import os from "os";
import AdmZip from "adm-zip";

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

const IdSchema = z.preprocess(
  (value) => parseInt(z.string().parse(value), 10),
  z.number().int()
);

const downloadAllResumesSchema = z
  .object({
    onlyConsentedToApplyToOtherPartners: z.preprocess(
      (value) => z.string().parse(value) === "true",
      z.boolean()
    ),
  })
  .strict();

const downloadAllResumesForCompanySchema = z
  .object({
    companyId: IdSchema,
  })
  .strict();

const downloadAllResumesForPositionSchema = z
  .object({
    positionId: IdSchema,
  })
  .strict();

const downloadSchema = z.union([
  downloadAllResumesSchema,
  downloadAllResumesForCompanySchema,
  downloadAllResumesForPositionSchema,
]);

const downloadAllResumesForCompany = async (
  res: NextApiResponse,
  companyId: number
) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new NotFoundError();
  }

  const tmpdir = os.tmpdir();
  const zipPath = `${tmpdir}/resumes_export-company_${companyId}.zip`;

  {
    const zip = new AdmZip();
    await zip.writeZipPromise(zipPath, { overwrite: true });
  }

  const BATCH_SIZE = 5;

  const positions = await prisma.position.findMany({
    where: { companyId },
    select: {
      id: true,
      title: true,
    },
  });

  for (const position of positions) {
    const positionDirectoryName = `${position.id}-${position.title}`;

    {
      const zip = new AdmZip(zipPath, { readEntries: false });
      zip.addFile(`${positionDirectoryName}/`, Buffer.from(""));
      zip.writeZip();
    }

    const resumeWhere = {
      where: {
        applications: {
          some: {
            positionId: position.id,
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
          id: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          data: true,
        },
        skip,
        take: BATCH_SIZE,
      });

      console.log("Adding %d resumes to zip file", resumes.length);

      resumes.forEach((resume) => {
        zip.addFile(
          `${positionDirectoryName}/U${resume.user.id}-CV${resume.id}-${resume.user.name}.pdf`,
          resume.data
        );
      });

      zip.writeZip();

      skip += BATCH_SIZE;
    }
  }

  const { size } = fs.statSync(zipPath);
  console.log(`Created zip file of size ${size} bytes`);

  res.status(200);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Length", size);
  const downloadedFileName = `resumes_for_company_${companyId}.zip`;
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
};

const downloadAllResumesForPosition = async (
  res: NextApiResponse,
  positionId: number
) => {
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
        id: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        data: true,
      },
      skip,
      take: BATCH_SIZE,
    });

    console.log("Adding %d resumes to zip file", resumes.length);

    resumes.forEach((resume) => {
      zip.addFile(
        `U${resume.user.id}-CV${resume.id}-${resume.user.name}.pdf`,
        resume.data
      );
    });

    zip.writeZip();

    skip += BATCH_SIZE;
  }

  const { size } = fs.statSync(zipPath);
  console.log(`Created zip file of size ${size} bytes`);

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
};

const downloadAllResumes = async (
  res: NextApiResponse,
  onlyConsentedToApplyToOtherPartners: boolean
) => {
  const tmpdir = os.tmpdir();
  const zipPath = `${tmpdir}/resumes_export.zip`;

  {
    const zip = new AdmZip();
    await zip.writeZipPromise(zipPath, { overwrite: true });
  }

  const BATCH_SIZE = 5;

  const resumeWhere = {
    where: {
      user: {
        consentApplyToOtherPartners: onlyConsentedToApplyToOtherPartners
          ? true
          : undefined,
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
        id: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        data: true,
      },
      skip,
      take: BATCH_SIZE,
    });

    console.log("Adding %d resumes to zip file", resumes.length);

    resumes.forEach((resume) => {
      zip.addFile(
        `U${resume.user.id}-CV${resume.id}-${resume.user.name}.pdf`,
        resume.data
      );
    });

    zip.writeZip();

    skip += BATCH_SIZE;
  }

  const { size } = fs.statSync(zipPath);
  console.log(`Created zip file of size ${size} bytes`);

  res.status(200);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Length", size);
  const downloadedFileName = `resumes.zip`;
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
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    throw new MethodNotAllowedError();
  }

  const session = await getServerSession(req, res);

  if (!session?.user) {
    throw new NotAuthenticatedError();
  }

  if (session.user.role !== Role.ADMIN) {
    throw new NotAuthorizedError();
  }

  const parseResult = downloadSchema.safeParse(req.query);

  if (!parseResult.success) {
    throw new BadRequestError(
      "invalid-params",
      `Request query string is invalid: ${parseResult.error.toString()}`
    );
  }

  const data = parseResult.data;
  if (data.hasOwnProperty("companyId")) {
    const { companyId } = data as z.infer<
      typeof downloadAllResumesForCompanySchema
    >;
    await downloadAllResumesForCompany(res, companyId);
  } else if (data.hasOwnProperty("positionId")) {
    const { positionId } = data as z.infer<
      typeof downloadAllResumesForPositionSchema
    >;
    await downloadAllResumesForPosition(res, positionId);
  } else if (data.hasOwnProperty("onlyConsentedToApplyToOtherPartners")) {
    const { onlyConsentedToApplyToOtherPartners } = data as z.infer<
      typeof downloadAllResumesSchema
    >;
    await downloadAllResumes(res, onlyConsentedToApplyToOtherPartners);
  } else {
    throw new BadRequestError();
  }
}

export default createHandler(handler);

export const config = {
  api: {
    // We don't want to set a response limit,
    // since the generated zip file could end up being very large
    responseLimit: false,
  },
};
