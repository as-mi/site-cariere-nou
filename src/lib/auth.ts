import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";

import { getServerSession as originalGetServerSession } from "next-auth";

import { authOptions } from "./next-auth-options";
import { getLoginPageUrl } from "./urls";

type Request = GetServerSidePropsContext["req"] | NextApiRequest;
type Response = GetServerSidePropsContext["res"] | NextApiResponse;

export const getServerSession = (req: Request, res: Response) =>
  originalGetServerSession(req, res, authOptions);

export const redirectToLoginPage = (returnUrl: string) => ({
  redirect: {
    destination: getLoginPageUrl(true, returnUrl),
    permanent: false,
  },
});
