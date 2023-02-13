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
  category: z.string().default(""),
  requiredSkills: z.string().default(""),
  workSchedule: z.string().default(""),
  workModel: z.string().default(""),
  duration: z.string().default(""),
  description: z.string().default(""),
});
const UpdateInput = z.object({
  id: EntityId,
  title: z.string(),
  category: z.string().default(""),
  requiredSkills: z.string().default(""),
  workSchedule: z.string().default(""),
  workModel: z.string().default(""),
  duration: z.string().default(""),
  description: z.string().default(""),
  activeTechnicalTestId: EntityId.or(z.null()),
  technicalTestIsMandatory: z.boolean().optional(),
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
  create: adminProcedure.input(CreateInput).mutation(async ({ input, ctx }) => {
    const { companyId } = input;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { slug: true },
    });

    if (!company) {
      throw new Error("Company with provided ID not found");
    }

    await prisma.position.create({
      data: input,
    });

    await revalidateCompanyPage(ctx, company.slug);
  }),
  update: adminProcedure.input(UpdateInput).mutation(async ({ input, ctx }) => {
    const { id } = input;

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
      data: input,
    });

    await revalidateCompanyPage(ctx, position.company.slug);
  }),
  delete: adminProcedure.input(DeleteInput).mutation(async ({ input, ctx }) => {
    const { id } = input;

    const position = await prisma.position.findUnique({
      where: { id },
      select: { company: { select: { slug: true } } },
    });

    if (!position) {
      throw new Error("Position not found");
    }

    await prisma.position.delete({ where: { id } });

    await revalidateCompanyPage(ctx, position.company.slug);
  }),
});
