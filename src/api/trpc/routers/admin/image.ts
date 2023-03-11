import { z } from "zod";

import { PaginationParamsSchema } from "~/api/pagination";

import prisma from "~/lib/prisma";

import { EntityId } from "../../schema";
import { adminProcedure, router } from "../..";

const ReadInput = z.object({ id: EntityId });
const ReadManyInput = PaginationParamsSchema;
const DeleteInput = z.object({ id: EntityId });

export const imageRouter = router({
  read: adminProcedure.input(ReadInput).query(async ({ input }) => {
    const { id } = input;
    const image = await prisma.image.findUnique({
      where: { id },
      select: {
        id: true,
        width: true,
        height: true,
      },
    });

    if (!image) {
      throw new Error("Image with provided ID not found");
    }

    return image;
  }),
  readMany: adminProcedure.input(ReadManyInput).query(async ({ input }) => {
    const { pageIndex, pageSize } = input;
    const skip = pageIndex * pageSize;
    const take = pageSize;

    const usersCount = await prisma.image.count();
    const pageCount = Math.ceil(usersCount / pageSize);

    const images = await prisma.image.findMany({
      select: {
        id: true,
        fileName: true,
        contentType: true,
        width: true,
        height: true,
      },
      skip,
      take,
      orderBy: { id: "asc" },
    });

    return {
      pageCount,
      results: images,
    };
  }),
  delete: adminProcedure.input(DeleteInput).mutation(async ({ input }) => {
    const { id } = input;

    await prisma.image.delete({ where: { id } });
  }),
});

export type ImageRouter = typeof imageRouter;
