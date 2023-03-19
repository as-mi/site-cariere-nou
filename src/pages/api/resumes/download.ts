import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import fs from "fs";
import os from "os";
import AdmZip from "adm-zip";

import { Prisma, Role } from "@prisma/client";

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
import {
  generateAttachmentDispositionHeaderValue,
  generateTechnicalTestAnswerSheet,
} from "~/lib/technical-tests-export";
import {
  AnswersSchema,
  Question,
  QuestionsSchema,
} from "~/lib/technical-tests-schema";

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

const downloadAllResumesForCompany = async (
  res: NextApiResponse,
  companyId: number
) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      name: true,
    },
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
      activeTechnicalTestId: true,
    },
  });

  for (const position of positions) {
    let technicalTestId = position.activeTechnicalTestId;
    let technicalTest: { title: string; questions: Prisma.JsonValue } | null =
      null;
    let technicalTestQuestions: Question[] = [];

    if (technicalTestId) {
      technicalTest = await prisma.technicalTest.findUnique({
        where: { id: technicalTestId },
        select: {
          title: true,
          questions: true,
        },
      });

      if (!technicalTest) {
        throw new NotFoundError(
          "not-found",
          "Technical test associated to this position not found"
        );
      }

      technicalTestQuestions = QuestionsSchema.parse(technicalTest.questions);
    }

    const positionDirectoryName = `${position.title}`;

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
              answers: technicalTestId
                ? {
                    where: { technicalTestId },
                  }
                : undefined,
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
          `${positionDirectoryName}/U${resume.user.id} - ${
            technicalTestId ? "CV - " : ""
          }${resume.user.name}.pdf`,
          resume.data
        );
      });

      if (technicalTestId) {
        console.log("Generating answer sheets for zip file");

        let answerSheetsCount = 0;
        for (const resume of resumes) {
          const participantAnswers = resume.user.answers;
          if (participantAnswers.length > 0) {
            const answers = AnswersSchema.parse(participantAnswers[0].answers);

            const answerSheetDocument = generateTechnicalTestAnswerSheet(
              resume.user.id,
              technicalTestId!,
              technicalTest!.title,
              technicalTestQuestions,
              answers
            );

            let buffers: Buffer[] = [];
            answerSheetDocument.on("data", buffers.push.bind(buffers));

            await new Promise((resolve) => {
              answerSheetDocument.on("end", () => {
                const pdfData = Buffer.concat(buffers);

                zip.addFile(
                  `${positionDirectoryName}/U${resume.user.id} - Răspunsuri test tehnic - ${resume.user.name}.pdf`,
                  pdfData
                );

                answerSheetsCount += 1;

                resolve(undefined);
              });
            });
          }
        }

        console.log("Added %d answer sheets to zip file", answerSheetsCount);
      }

      zip.writeZip();

      skip += BATCH_SIZE;
    }
  }

  const { size } = fs.statSync(zipPath);
  console.log(`Created zip file of size ${size} bytes`);

  res.status(200);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Length", size);
  const downloadedFileName = `Resumes export for ${company.name}.zip`;
  res.setHeader(
    "Content-Disposition",
    generateAttachmentDispositionHeaderValue(downloadedFileName)
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
    select: {
      title: true,
      activeTechnicalTestId: true,
      company: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!position) {
    throw new NotFoundError();
  }

  let technicalTestId = position.activeTechnicalTestId;
  let technicalTest: { title: string; questions: Prisma.JsonValue } | null =
    null;
  let technicalTestQuestions: Question[] = [];

  if (technicalTestId) {
    technicalTest = await prisma.technicalTest.findUnique({
      where: { id: technicalTestId },
      select: {
        title: true,
        questions: true,
      },
    });

    if (!technicalTest) {
      throw new NotFoundError(
        "not-found",
        "Technical test associated to this position not found"
      );
    }

    technicalTestQuestions = QuestionsSchema.parse(technicalTest.questions);
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
            answers: technicalTestId
              ? {
                  where: { technicalTestId },
                }
              : undefined,
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
        `U${resume.user.id} - ${technicalTestId ? "CV - " : ""}${
          resume.user.name
        }.pdf`,
        resume.data
      );
    });

    if (technicalTestId) {
      console.log("Generating answer sheets for zip file");

      let answerSheetsCount = 0;
      for (const resume of resumes) {
        const participantAnswers = resume.user.answers;
        if (participantAnswers.length > 0) {
          const answers = AnswersSchema.parse(participantAnswers[0].answers);

          const answerSheetDocument = generateTechnicalTestAnswerSheet(
            resume.user.id,
            technicalTestId!,
            technicalTest!.title,
            technicalTestQuestions,
            answers
          );

          let buffers: Buffer[] = [];
          answerSheetDocument.on("data", buffers.push.bind(buffers));

          await new Promise((resolve) => {
            answerSheetDocument.on("end", () => {
              const pdfData = Buffer.concat(buffers);

              zip.addFile(
                `U${resume.user.id} - Răspunsuri test tehnic - ${resume.user.name}.pdf`,
                pdfData
              );

              answerSheetsCount += 1;

              resolve(undefined);
            });
          });
        }
      }

      console.log("Added %d answer sheets to zip file", answerSheetsCount);
    }

    zip.writeZip();

    skip += BATCH_SIZE;
  }

  const { size } = fs.statSync(zipPath);
  console.log(`Created zip file of size ${size} bytes`);

  res.status(200);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Length", size);
  const downloadedFileName = `Resumes export for ${position.company.name} - ${position.title}.zip`;
  res.setHeader(
    "Content-Disposition",
    generateAttachmentDispositionHeaderValue(downloadedFileName)
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
        `U${resume.user.id} - CV ${resume.id} - ${resume.user.name}.pdf`,
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
  const downloadedFileName = `All resumes export.zip`;
  res.setHeader(
    "Content-Disposition",
    generateAttachmentDispositionHeaderValue(downloadedFileName)
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

  const query = req.query;
  if (query.hasOwnProperty("companyId")) {
    const parseResult = downloadAllResumesForCompanySchema.safeParse(query);
    if (!parseResult.success) {
      throw new BadRequestError(
        "invalid-params",
        `Request query string is invalid: ${parseResult.error.toString()}`
      );
    }

    await downloadAllResumesForCompany(res, parseResult.data.companyId);
  } else if (req.query.hasOwnProperty("positionId")) {
    const parseResult = downloadAllResumesForPositionSchema.safeParse(query);
    if (!parseResult.success) {
      throw new BadRequestError(
        "invalid-params",
        `Request query string is invalid: ${parseResult.error.toString()}`
      );
    }

    await downloadAllResumesForPosition(res, parseResult.data.positionId);
  } else if (req.query.hasOwnProperty("onlyConsentedToApplyToOtherPartners")) {
    const parseResult = downloadAllResumesSchema.safeParse(query);
    if (!parseResult.success) {
      throw new BadRequestError(
        "invalid-params",
        `Request query string is invalid: ${parseResult.error.toString()}`
      );
    }

    await downloadAllResumes(
      res,
      parseResult.data.onlyConsentedToApplyToOtherPartners
    );
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
