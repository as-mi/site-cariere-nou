import { adminProcedure, router } from "../..";

import { revalidateHomePage } from "~/api/revalidation";

import { settingRouter } from "./setting";
import { eventRouter } from "./event";
import { userRouter } from "./user";
import { imageRouter } from "./image";
import { companyRouter } from "./company";
import { positionRouter } from "./position";
import { technicalTestRouter } from "./technicalTest";
import { resumeRouter } from "./resume";

export const adminRouter = router({
  setting: settingRouter,
  event: eventRouter,
  user: userRouter,
  image: imageRouter,
  company: companyRouter,
  position: positionRouter,
  technicalTest: technicalTestRouter,
  resume: resumeRouter,
  revalidateHomePage: adminProcedure.mutation(async ({ ctx }) => {
    await revalidateHomePage(ctx);
  }),
});

// Export type definition of API
export type AdminRouter = typeof adminRouter;
