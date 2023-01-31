import { participantProcedure, router } from "..";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

import prisma from "~/lib/prisma";

const ProfileUpdateInput = z.object({
  id: z.number().int(),
  name: z.string(),
  phoneNumber: z.string(),
});

export const participantRouter = router({
  profileUpdate: participantProcedure
    .input(ProfileUpdateInput)
    .mutation(async ({ input, ctx }) => {
      const { id, name, phoneNumber } = input;

      if (ctx.user!.id !== id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot update another user's profile",
        });
      }

      await prisma.user.update({
        where: { id },
        data: {
          name,
          profile: {
            upsert: {
              create: {
                phoneNumber,
              },
              update: {
                phoneNumber,
              },
            },
          },
        },
      });
    }),
});
