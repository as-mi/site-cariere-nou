import { adminProcedure, router } from "..";
import { z } from "zod";

import prisma from "~/lib/prisma";
import { hashPassword } from "~/lib/accounts";
import { PackageType, Role } from "@prisma/client";

export const adminRouter = router({
  userCreate: adminProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
        role: z.enum([Role.PARTICIPANT, Role.RECRUITER, Role.ADMIN]),
      })
    )
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
  userDelete: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
      })
    )
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
    .input(
      z.object({
        name: z.string(),
        slug: z.string().transform((val) => val.toLowerCase()),
        siteUrl: z.string().default(""),
        packageType: z.enum([
          PackageType.BRONZE,
          PackageType.SILVER,
          PackageType.GOLD,
        ]),
        logoImageId: z.number().int(),
        description: z.string().default(""),
      })
    )
    .mutation(async ({ input, ctx: { res } }) => {
      await prisma.company.create({
        data: input,
      });

      // Revalidate the home page to update the companies section
      await res.revalidate("/");
    }),
  companyDelete: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      await prisma.company.delete({ where: { id } });
    }),
});
