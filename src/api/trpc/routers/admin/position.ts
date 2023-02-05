import { z } from "zod";

import { revalidateCompanyPage } from "~/api/revalidation";
import prisma from "~/lib/prisma";

import { adminProcedure, router } from "../..";
import { EntityId } from "../../schema";

const GetAllInput = z.object({
  companyId: EntityId,
});
const ReadInput = z.object({
  id: EntityId,
});
const CreateInput = z.object({
  companyId: EntityId,
  title: z.string(),
  description: z.string().default(""),
});
const UpdateInput = z.object({
  id: EntityId,
  title: z.string(),
  description: z.string().default(""),
});
const DeleteInput = z.object({
  id: EntityId,
});

export const positionRouter = router({
  getAll: adminProcedure.input(GetAllInput).query(async ({ input }) => {
    const { companyId } = input;

    const positions = await prisma.position.findMany({
      where: { companyId },
      select: {
        id: true,
        title: true,
      },
    });
    return positions;
  }),
  read: adminProcedure.input(ReadInput).query(async ({ input }) => {
    const { id } = input;

    const position = await prisma.position.findUnique({
      where: { id },
    });
    return position;
  }),
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
  update: adminProcedure
    .input(UpdateInput)
    .mutation(async ({ input, ctx: { res } }) => {
      const { id, title, description } = input;

      const position = await prisma.position.findUnique({
        where: { id },
        select: {
          company: {
            select: {
              slug: true,
            },
          },
        },
      });

      if (!position) {
        throw new Error("Position with provided ID not found");
      }

      await prisma.position.update({
        where: { id },
        data: {
          title,
          description,
        },
      });

      await revalidateCompanyPage(res, position.company.slug);
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
