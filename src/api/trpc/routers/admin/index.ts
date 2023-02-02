import { adminProcedure, router } from "../..";

import { userRouter } from "./user";
import { companyRouter } from "./company";

export const adminRouter = router({
  user: userRouter,
  company: companyRouter,
  revalidateHomePage: adminProcedure.mutation(async ({ ctx: { res } }) => {
    await res.revalidate("/");
  }),
});
