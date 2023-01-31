import { adminProcedure, router } from "..";
import { z } from "zod";

import prisma from "~/lib/prisma";
import { hashPassword } from "~/lib/accounts";
import { PackageType, Role } from "@prisma/client";

import { ZodId } from "../schema";

const ZodAllRoles = z.enum([Role.PARTICIPANT, Role.RECRUITER, Role.ADMIN]);

const UserReadInput = z.object({ id: ZodId });
const UserCreateInput = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: ZodAllRoles,
});
const UserUpdateInput = z.object({
  id: ZodId,
  name: z.string(),
  email: z.string(),
  password: z.string().optional(),
  role: ZodAllRoles,
});
const UserDeleteInput = z.object({ id: ZodId });

const CompanyCreateInput = z.object({
  name: z.string(),
  slug: z.string().transform((val) => val.toLowerCase()),
  siteUrl: z.string().default(""),
  packageType: z.enum([
    PackageType.BRONZE,
    PackageType.SILVER,
    PackageType.GOLD,
  ]),
  logoImageId: ZodId,
  description: z.string().default(""),
});
const CompanyDeleteInput = z.object({
  id: ZodId,
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
  companyCreate: adminProcedure
    .input(CompanyCreateInput)
    .mutation(async ({ input, ctx: { res } }) => {
      await prisma.company.create({
        data: input,
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
