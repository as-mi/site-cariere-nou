import { adminProcedure, router } from "../..";

import { revalidateHomePage } from "~/api/revalidation";

import { settingRouter } from "./setting";
import { userRouter } from "./user";
import { imageRouter } from "./image";
import { companyRouter } from "./company";
import { positionRouter } from "./position";
import { technicalTestRouter } from "./technicalTest";

export const adminRouter = router({
  setting: settingRouter,
  user: userRouter,
  image: imageRouter,
  company: companyRouter,
  position: positionRouter,
  technicalTest: technicalTestRouter,
  revalidateHomePage: adminProcedure.mutation(async ({ ctx }) => {
    await revalidateHomePage(ctx);
  }),
});
