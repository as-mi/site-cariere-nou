import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";

import { getServerSession as originalGetServerSession } from "next-auth";

import { authOptions } from "./next-auth-options";

type Request = GetServerSidePropsContext["req"] | NextApiRequest;
type Response = GetServerSidePropsContext["res"] | NextApiResponse;

export const getServerSession = (req: Request, res: Response) =>
  originalGetServerSession(req, res, authOptions);

export const redirectToLoginPage = (returnUrl: string) => ({
  redirect: {
    destination: `/auth/login?authenticationRequired&callbackUrl=${encodeURIComponent(
      returnUrl
    )}`,
    permanent: false,
  },
});
