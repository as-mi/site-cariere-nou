import { z } from "zod";

import prisma from "~/lib/prisma";

import { EntityId } from "../../schema";
import { adminProcedure, router } from "../..";

const DeleteInput = z.object({ id: EntityId });

export const imageRouter = router({
  delete: adminProcedure.input(DeleteInput).mutation(async ({ input }) => {
    const { id } = input;

    await prisma.image.delete({ where: { id } });
  }),
});

export type ImageRouter = typeof imageRouter;
