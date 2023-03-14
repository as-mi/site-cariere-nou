import { z } from "zod";

import { PaginationParamsSchema } from "~/api/pagination";
import { revalidateCompanyPage } from "~/api/revalidation";
import prisma from "~/lib/prisma";

import { adminProcedure, router } from "../..";
import { EntityId } from "../../schema";

const OrderSchema = z.number().int().gte(1);

const GetAllInput = z.object({
  companyId: EntityId,
});
const ReadInput = z.object({
  id: EntityId,
});
const ReadManyInput = PaginationParamsSchema;
const ReadApplicationsInput = z
  .object({ id: EntityId })
  .and(PaginationParamsSchema);
const CreateInput = z.object({
  companyId: EntityId,
  title: z.string(),
  order: OrderSchema,
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
  order: OrderSchema,
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
  readMany: adminProcedure.input(ReadManyInput).query(async ({ input }) => {
    const { pageIndex, pageSize } = input;
    const skip = pageIndex * pageSize;
    const take = pageSize;

    const positionsCount = await prisma.position.count();
    const pageCount = Math.ceil(positionsCount / pageSize);

    const positions = await prisma.position.findMany({
      select: {
        id: true,
        title: true,
        company: {
          select: {
            name: true,
          },
        },
      },
      skip,
      take,
      orderBy: { id: "asc" },
    });

    return {
      pageCount,
      results: positions.map((position) => ({
        id: position.id,
        title: position.title,
        companyName: position.company.name,
      })),
    };
  }),
  readApplications: adminProcedure
    .input(ReadApplicationsInput)
    .query(async ({ input }) => {
      const { id: positionId, pageIndex, pageSize } = input;
      const skip = pageIndex * pageSize;
      const take = pageSize;

      const applicationsCount = await prisma.participantApplyToPosition.count({
        where: { positionId },
      });
      const pageCount = Math.ceil(applicationsCount / pageSize);

      const applications = await prisma.participantApplyToPosition.findMany({
        where: { positionId },
        select: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          resumeId: true,
        },
        skip,
        take,
        orderBy: [{ userId: "asc" }],
      });

      return {
        pageCount,
        results: applications,
      };
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
