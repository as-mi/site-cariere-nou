import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession as originalGetServerSession } from "next-auth";

import { authOptions } from "./next-auth-options";

export const getServerSession = (req: NextApiRequest, res: NextApiResponse) =>
  originalGetServerSession(req, res, authOptions);

export const redirectToLoginPage = (returnUrl: string) => ({
  redirect: {
    destination: `/auth/login?authenticationRequired&callbackUrl=${encodeURIComponent(
      returnUrl
    )}`,
    permanent: false,
  },
});
