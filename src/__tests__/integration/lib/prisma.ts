import { Role } from "@prisma/client";

import { wrapInTransaction } from "~/lib/test/database";

describe("prisma", () => {
  it("sets the created at and updated at fields correctly", async () => {
    const EPSILON_MILLISECONDS = 5000;

    await wrapInTransaction(async (tx) => {
      const now = Date.now();

      const user = await tx.user.create({
        data: {
          email: "example@example.com",
          name: "Test user",
          role: Role.PARTICIPANT,
        },
      });

      // Check that the creation time and update time are properly recorded
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      // Check that the timestamps are relatively fresh
      expect(Math.abs(now - +user.createdAt)).toBeLessThan(
        EPSILON_MILLISECONDS,
      );
      expect(Math.abs(now - +user.updatedAt)).toBeLessThan(
        EPSILON_MILLISECONDS,
      );
    });
  });
});
