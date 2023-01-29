import { adminProcedure, router } from "../trpc";
import { z } from "zod";

import prisma from "~/lib/prisma";
import { hashPassword } from "~/lib/accounts";
import { Role } from "@prisma/client";

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
        id: z.number(),
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
});
