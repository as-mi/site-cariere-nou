import { z } from "zod";

import { revalidateCompanyPage, revalidateHomePage } from "~/api/revalidation";
import prisma from "~/lib/prisma";

import { adminProcedure, router } from "../..";
import { AllPackageTypes, EntityId } from "../../schema";

const Slug = z.string().transform((val) => val.toLowerCase());

const ReadInput = z.object({
  id: EntityId,
});
const CreateInput = z.object({
  name: z.string(),
  slug: Slug,
  siteUrl: z.string().default(""),
  packageType: AllPackageTypes,
  logoImageId: EntityId,
  description: z.string().default(""),
});
const UpdateInput = z.object({
  id: EntityId,
  name: z.string(),
  slug: Slug,
  siteUrl: z.string().default(""),
  packageType: AllPackageTypes,
  description: z.string().default(""),
});
const DeleteInput = z.object({
  id: EntityId,
});

export const companyRouter = router({
  getAll: adminProcedure.query(async () => {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return companies;
  }),
  read: adminProcedure.input(ReadInput).query(async ({ input }) => {
    const { id } = input;
    const user = await prisma.company.findUnique({ where: { id } });
    return user;
  }),
  create: adminProcedure
    .input(CreateInput)
    .mutation(async ({ input, ctx: { res } }) => {
      const { name, slug, siteUrl, packageType, logoImageId, description } =
        input;

      await prisma.company.create({
        data: {
          name,
          slug,
          siteUrl,
          packageType,
          logoImageId,
          description,
        },
      });

      await revalidateHomePage(res);
      // Just in case there previously was another company with the same slug
      await revalidateCompanyPage(res, slug);
    }),
  update: adminProcedure
    .input(UpdateInput)
    .mutation(async ({ input, ctx: { res } }) => {
      const { id, name, slug, siteUrl, packageType, description } = input;

      await prisma.company.update({
        where: { id },
        data: {
          name,
          slug,
          siteUrl,
          packageType,
          description,
        },
      });

      await revalidateHomePage(res);
      await revalidateCompanyPage(res, slug);
    }),
  delete: adminProcedure
    .input(DeleteInput)
    .mutation(async ({ input, ctx: { res } }) => {
      const { id } = input;

      const company = await prisma.company.findUnique({
        where: { id },
        select: { slug: true },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      await prisma.company.delete({ where: { id } });

      await revalidateHomePage(res);
      await revalidateCompanyPage(res, company.slug);
    }),
});