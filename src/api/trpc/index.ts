import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";

import { Role } from "@prisma/client";

// Create a new tRPC instance
const t = initTRPC.context<Context>().create();

const isAuthenticated = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return next({ ctx });
});

const createIsRoleMiddleware = (role: Role) =>
  t.middleware(({ next, ctx }) => {
    if (ctx.user?.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not authorized to perform this request",
      });
    }

    return next({ ctx });
  });
const isParticipant = createIsRoleMiddleware(Role.PARTICIPANT);
const isAdmin = createIsRoleMiddleware(Role.ADMIN);

// Export the router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const authenticatedProcedure = t.procedure.use(isAuthenticated);
export const participantProcedure = t.procedure
  .use(isAuthenticated)
  .use(isParticipant);
export const adminProcedure = t.procedure.use(isAuthenticated).use(isAdmin);
