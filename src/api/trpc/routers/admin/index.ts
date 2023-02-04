import { adminProcedure, router } from "../..";

import { revalidateHomePage } from "~/api/revalidation";

import { userRouter } from "./user";
import { companyRouter } from "./company";
import { positionRouter } from "./position";

export const adminRouter = router({
  user: userRouter,
  company: companyRouter,
  position: positionRouter,
  revalidateHomePage: adminProcedure.mutation(async ({ ctx: { res } }) => {
    await revalidateHomePage(res);
  }),
});
