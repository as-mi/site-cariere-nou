import { z } from "zod";

import { revalidateCompanyPage } from "~/api/revalidation";
import prisma from "~/lib/prisma";

import { adminProcedure, router } from "../..";
import { EntityId } from "../../schema";

const CreateInput = z.object({
  companyId: EntityId,
  title: z.string(),
  description: z.string().default(""),
});
const DeleteInput = z.object({
  id: EntityId,
});

export const positionRouter = router({
  create: adminProcedure
    .input(CreateInput)
    .mutation(async ({ input, ctx: { res } }) => {
      const { companyId, title, description } = input;

      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { slug: true },
      });

      if (!company) {
        throw new Error("Company with provided ID not found");
      }

      await prisma.position.create({
        data: {
          companyId,
          title,
          description,
        },
      });

      await revalidateCompanyPage(res, company.slug);
    }),
  delete: adminProcedure
    .input(DeleteInput)
    .mutation(async ({ input, ctx: { res } }) => {
      const { id } = input;

      const position = await prisma.position.findUnique({
        where: { id },
        select: { company: { select: { slug: true } } },
      });

      if (!position) {
        throw new Error("Position not found");
      }

      await prisma.position.delete({ where: { id } });

      await revalidateCompanyPage(res, position.company.slug);
    }),
});