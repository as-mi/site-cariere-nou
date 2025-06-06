import { z } from "zod";

import { PaginationParamsSchema } from "~/api/pagination";
import { revalidateCompanyPage, revalidateHomePage } from "~/api/revalidation";
import prisma from "~/lib/prisma";

import { adminProcedure, router } from "../..";
import { AllPackageTypes, EntityId } from "../../schema";

const Slug = z.string().transform((val) => val.toLowerCase());

const ReadInput = z.object({
  id: EntityId,
});
const ReadManyInput = PaginationParamsSchema;
const CreateInput = z.object({
  name: z.string(),
  slug: Slug,
  siteUrl: z.string().default(""),
  facebookUrl: z.string().default(""),
  instagramUrl: z.string().default(""),
  linkedinUrl: z.string().default(""),
  packageType: AllPackageTypes,
  logoImageId: EntityId,
  description: z.string().default(""),
  positionsExternalUrl: z.string().nullable().default(null),
  thisYearPartner: z.boolean().default(false),
  videoUrl: z.string().nullable().default(null),
});
const UpdateInput = z.object({
  id: EntityId,
  name: z.string(),
  slug: Slug,
  siteUrl: z.string().default(""),
  facebookUrl: z.string().default(""),
  instagramUrl: z.string().default(""),
  linkedinUrl: z.string().default(""),
  packageType: AllPackageTypes,
  description: z.string().default(""),
  positionsExternalUrl: z.string().nullable().default(null),
  thisYearPartner: z.boolean().default(false),
  videoUrl: z.string().nullable().default(null),
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
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        name: true,
        slug: true,
        siteUrl: true,
        facebookUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
        packageType: true,
        logoImageId: true,
        logo: {
          select: {
            id: true,
            width: true,
            height: true,
          },
        },
        description: true,
        positionsExternalUrl: true,
        thisYearPartner: true,
        videoUrl: true,
      },
    });
    return company;
  }),
  readMany: adminProcedure.input(ReadManyInput).query(async ({ input }) => {
    const { pageIndex, pageSize } = input;
    const skip = pageIndex * pageSize;
    const take = pageSize;

    const companiesCount = await prisma.company.count();
    const pageCount = Math.ceil(companiesCount / pageSize);

    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        packageType: true,
        thisYearPartner: true,
      },
      skip,
      take,
      orderBy: { id: "asc" },
    });

    return {
      pageCount,
      results: companies,
    };
  }),
  create: adminProcedure.input(CreateInput).mutation(async ({ input, ctx }) => {
    const {
      name,
      slug,
      siteUrl,
      instagramUrl,
      facebookUrl,
      linkedinUrl,
      packageType,
      logoImageId,
      description,
      positionsExternalUrl,
      thisYearPartner,
      videoUrl,
    } = input;

    await prisma.company.create({
      data: {
        name,
        slug,
        siteUrl,
        facebookUrl,
        instagramUrl,
        linkedinUrl,
        packageType,
        logoImageId,
        description,
        positionsExternalUrl,
        thisYearPartner,
        videoUrl,
      },
    });

    await revalidateHomePage(ctx);
    // Just in case there previously was another company with the same slug
    await revalidateCompanyPage(ctx, slug);
  }),
  update: adminProcedure.input(UpdateInput).mutation(async ({ input, ctx }) => {
    const {
      id,
      name,
      slug,
      siteUrl,
      instagramUrl,
      facebookUrl,
      linkedinUrl,
      packageType,
      description,
      positionsExternalUrl,
      thisYearPartner,
      videoUrl,
    } = input;

    await prisma.company.update({
      where: { id },
      data: {
        name,
        slug,
        siteUrl,
        facebookUrl,
        instagramUrl,
        linkedinUrl,
        packageType,
        description,
        positionsExternalUrl,
        thisYearPartner,
        videoUrl,
      },
    });

    await revalidateHomePage(ctx);
    await revalidateCompanyPage(ctx, slug);
  }),
  delete: adminProcedure.input(DeleteInput).mutation(async ({ input, ctx }) => {
    const { id } = input;

    const company = await prisma.company.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    await prisma.company.delete({ where: { id } });

    await revalidateHomePage(ctx);
    await revalidateCompanyPage(ctx, company.slug);
  }),
});
