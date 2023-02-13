import { inferProcedureInput } from "@trpc/server";

import { Role } from "@prisma/client";

import prismaMock from "~/lib/test/prisma-mock";

import { createContextInner } from "~/api/trpc/context";
import { UserRouter, userRouter } from "~/api/trpc/routers/admin/user";

const adminUser = { id: 1, role: Role.ADMIN };

describe("userRouter", () => {
  describe("create", () => {
    it("creates a new user", async () => {
      const ctx = await createContextInner({
        user: adminUser,
        revalidate: async () => {},
      });
      const caller = userRouter.createCaller(ctx);

      const input: inferProcedureInput<UserRouter["create"]> = {
        name: "Test user",
        email: "example@example.com",
        password: "123456a",
        role: Role.PARTICIPANT,
      };

      await caller.create(input);

      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it("validates minimum password requirements", async () => {
      const ctx = await createContextInner({
        user: adminUser,
        revalidate: async () => {},
      });
      const caller = userRouter.createCaller(ctx);

      const input: inferProcedureInput<UserRouter["create"]> = {
        name: "User with weak password",
        email: "admin@example.com",
        password: "1234",
        role: Role.ADMIN,
      };

      expect(caller.create(input)).rejects.toThrow("password must be at least");

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });
});
