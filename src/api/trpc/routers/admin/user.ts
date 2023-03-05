import { z } from "zod";

import { hashPassword, validatePassword } from "~/lib/accounts";
import prisma from "~/lib/prisma";
import { BadRequestError } from "~/api/errors";

import { AllRoles, EntityId } from "../../schema";
import { adminProcedure, router } from "../..";

const ReadInput = z.object({ id: EntityId });
const ReadManyInput = z.object({
  pageIndex: z.number().int().gte(0),
  pageSize: z.number().int().gte(10).lte(50).multipleOf(10),
});
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
  readMany: adminProcedure.input(ReadManyInput).query(async ({ input }) => {
    const { pageIndex, pageSize } = input;
    const skip = pageIndex * pageSize;
    const take = pageSize;

    const usersCount = await prisma.user.count();
    const pageCount = Math.ceil(usersCount / pageSize);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      skip,
      take,
      orderBy: { id: "asc" },
    });

    return {
      pageCount,
      users,
    };
  }),
  create: adminProcedure.input(CreateInput).mutation(async ({ input }) => {
    const { name, email, password, role } = input;

    let passwordHash;
    if (password) {
      try {
        validatePassword(password);
      } catch (e) {
        if (e instanceof BadRequestError) {
          throw new Error(`Password validation error: ${e.message}`);
        } else {
          throw e;
        }
      }
      passwordHash = await hashPassword(password);
    } else {
      passwordHash = "";
    }

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

export type UserRouter = typeof userRouter;
