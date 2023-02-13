import { adminProcedure, router } from "../..";

import { revalidateHomePage } from "~/api/revalidation";

import { userRouter } from "./user";
import { companyRouter } from "./company";
import { positionRouter } from "./position";
import { technicalTestRouter } from "./technicalTest";

export const adminRouter = router({
  user: userRouter,
  company: companyRouter,
  position: positionRouter,
  technicalTest: technicalTestRouter,
  revalidateHomePage: adminProcedure.mutation(async ({ ctx }) => {
    await revalidateHomePage(ctx);
  }),
});
