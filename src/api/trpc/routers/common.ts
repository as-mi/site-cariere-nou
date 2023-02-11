import { authenticatedProcedure, router } from "..";

import prisma from "~/lib/prisma";

export const commonRouter = router({
  profileRead: authenticatedProcedure.query(async ({ ctx }) => {
    const id = ctx.user!.id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        profile: {
          select: {
            phoneNumber: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User with provided ID not found");
    }

    return {
      name: user.name,
      phoneNumber: user.profile?.phoneNumber ?? "",
    };
  }),
});
