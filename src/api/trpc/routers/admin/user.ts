import { z } from "zod";

import { hashPassword } from "~/lib/accounts";
import prisma from "~/lib/prisma";

import { AllRoles, EntityId } from "../../schema";
import { adminProcedure, router } from "../..";

const ReadInput = z.object({ id: EntityId });
const CreateInput = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: AllRoles,
});
const UpdateInput = z.object({
  id: EntityId,
  name: z.string(),
  email: z.string(),
  password: z.string().optional(),
  role: AllRoles,
});
const DeleteInput = z.object({ id: EntityId });

export const userRouter = router({
  read: adminProcedure.input(ReadInput).query(async ({ input }) => {
    const { id } = input;
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  }),
  create: adminProcedure.input(CreateInput).mutation(async ({ input }) => {
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
  update: adminProcedure.input(UpdateInput).mutation(async ({ input }) => {
    const { id, name, email, password, role } = input;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new Error("User not found");
    }

    let emailVerified = undefined;
    if (user.email !== email) {
      emailVerified = new Date();
    }

    let passwordHash = undefined;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        emailVerified,
        passwordHash,
        role,
      },
    });
  }),
  delete: adminProcedure
    .input(DeleteInput)
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