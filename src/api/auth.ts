import { Role } from "@prisma/client";
import { NextApiHandler } from "next";

import { getServerSession } from "~/lib/auth";

import { NotAuthenticatedError, NotAuthorizedError } from "./errors";

export const requireAuthentication = <T>(
  handler: NextApiHandler<T>
): NextApiHandler<T> => {
  return async (req, res) => {
    const session = await getServerSession(req, res);

    if (!session?.user) {
      throw new NotAuthenticatedError();
    }

    await handler(req, res);
  };
};

const requireRole = <T>(
  handler: NextApiHandler<T>,
  role: Role
): NextApiHandler<T> => {
  return async (req, res) => {
    const session = await getServerSession(req, res);

    if (!session?.user) {
      throw new NotAuthenticatedError();
    }

    if (session.user.role !== role) {
      throw new NotAuthorizedError();
    }

    await handler(req, res);
  };
};

export const requireAdmin = <T>(handler: NextApiHandler<T>) =>
  requireRole(handler, Role.ADMIN);
