import prisma from "~/lib/prisma";

import { PaginationParamsSchema } from "~/api/pagination";

import { adminProcedure, router } from "../..";

const ReadManyInput = PaginationParamsSchema;

export const resumeRouter = router({
  readMany: adminProcedure.input(ReadManyInput).query(async ({ input }) => {
    const { pageIndex, pageSize } = input;
    const skip = pageIndex * pageSize;
    const take = pageSize;

    const resumesCount = await prisma.resume.count();
    const pageCount = Math.ceil(resumesCount / pageSize);

    const resumes = await prisma.resume.findMany({
      select: {
        id: true,
        user: {
          select: {
            name: true,
          },
        },
        fileName: true,
      },
      skip,
      take,
      orderBy: { id: "asc" },
    });

    const ids = resumes.map((resume) => resume.id);
    const resumeSizes = await prisma.$queryRawUnsafe<
      { id: number; length: number }[]
    >(`SELECT id, LENGTH(data)
      FROM "Resume"
      WHERE id IN (${ids})
      LIMIT ${pageSize};`);
    const resumeSizesById = new Map<number, number>();
    resumeSizes.forEach(({ id, length }) => resumeSizesById.set(id, length));

    return {
      pageCount,
      results: resumes.map((resume) => ({
        ...resume,
        fileSize: resumeSizesById.get(resume.id)!,
      })),
    };
  }),
});
