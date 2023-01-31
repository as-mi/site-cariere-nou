import { adminProcedure, router } from "..";
import { z } from "zod";

import prisma from "~/lib/prisma";
import { hashPassword } from "~/lib/accounts";
import { PackageType, Role } from "@prisma/client";

import { EntityId } from "../schema";

const AllRoles = z.enum([Role.PARTICIPANT, Role.RECRUITER, Role.ADMIN]);
const AllPackageTypes = z.enum([
  PackageType.BRONZE,
  PackageType.SILVER,
  PackageType.GOLD,
]);

const UserReadInput = z.object({ id: EntityId });
const UserCreateInput = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: AllRoles,
});
const UserUpdateInput = z.object({
  id: EntityId,
  name: z.string(),
  email: z.string(),
  password: z.string().optional(),
  role: AllRoles,
});
const UserDeleteInput = z.object({ id: EntityId });

const CompanySlug = z.string().transform((val) => val.toLowerCase());

const CompanyReadInput = z.object({
  id: EntityId,
});
const CompanyCreateInput = z.object({
  name: z.string(),
  slug: CompanySlug,
  siteUrl: z.string().default(""),
  packageType: AllPackageTypes,
  logoImageId: EntityId,
  description: z.string().default(""),
});
const CompanyUpdateInput = z.object({
  id: EntityId,
  name: z.string(),
  slug: CompanySlug,
  siteUrl: z.string().default(""),
  packageType: AllPackageTypes,
  description: z.string().default(""),
});
const CompanyDeleteInput = z.object({
  id: EntityId,
});

export const adminRouter = router({
  userRead: adminProcedure.input(UserReadInput).query(async ({ input }) => {
    const { id } = input;
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  }),
  userCreate: adminProcedure
    .input(UserCreateInput)
    .mutation(async ({ input }) => {
      const { name, email, password, role } = input;

      const passwordHash = password ? await hashPassword(password) : "";

      await prisma.user.create({
        data: {
          name,
          email,
          emailVerified: new Date(),
          passwordHash,
          role,
        },
      });
    }),
  userUpdate: adminProcedure
    .input(UserUpdateInput)
    .mutation(async ({ input }) => {
      const { id, name, email, password, role } = input;

      const passwordHash = password ? await hashPassword(password) : "";

      await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
          emailVerified: new Date(),
          passwordHash,
          role,
        },
      });
    }),
  userDelete: adminProcedure
    .input(UserDeleteInput)
    .mutation(async ({ input, ctx: { user } }) => {
      const { id } = input;
      if (user!.id === id) {
        throw new Error("Cannot delete currently logged-in user");
      }

      await prisma.user.delete({
        where: {
          id: input.id,
        },
      });
    }),
  revalidateHomePage: adminProcedure.mutation(async ({ ctx: { res } }) => {
    await res.revalidate("/");
  }),
  companyRead: adminProcedure
    .input(CompanyReadInput)
    .query(async ({ input }) => {
      const { id } = input;
      const user = await prisma.company.findUnique({ where: { id } });
      return user;
    }),
  companyCreate: adminProcedure
    .input(CompanyCreateInput)
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

      // Revalidate the home page to update the companies section
      await res.revalidate("/");
    }),
  companyUpdate: adminProcedure
    .input(CompanyUpdateInput)
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

      // Revalidate the home page to update the companies section
      await res.revalidate("/");
    }),
  companyDelete: adminProcedure
    .input(CompanyDeleteInput)
    .mutation(async ({ input }) => {
      const { id } = input;

      await prisma.company.delete({ where: { id } });
    }),
});
