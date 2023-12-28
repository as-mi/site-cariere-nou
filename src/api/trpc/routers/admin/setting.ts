import { adminProcedure, router } from "../..";

import _ from "lodash";
import { z } from "zod";

import prisma from "~/lib/prisma";
import { Setting, SETTINGS } from "~/lib/settings";

import { revalidateAllPages } from "~/api/revalidation";

const GetAllOutput = z.object(
  Object.fromEntries(Object.keys(SETTINGS).map((key) => [key, z.any()])),
);

const UpdateInput = z.object({
  key: z.string(),
  value: z.string(),
});

export const settingRouter = router({
  getAll: adminProcedure.output(GetAllOutput).query(async () => {
    const settingValues = await prisma.settingValue.findMany();
    const settings = _.keyBy(settingValues, (settingValue) => settingValue.key);
    return settings;
  }),
  update: adminProcedure.input(UpdateInput).mutation(async ({ input, ctx }) => {
    const { key } = input;
    if (!(key in SETTINGS)) {
      throw new Error("Invalid setting key");
    }

    const schema = (SETTINGS as Record<string, Setting>)[key].schema;

    let valueObject: unknown | undefined;
    try {
      valueObject = JSON.parse(input.value);
    } catch (e) {
      throw new Error(`Failed to parse setting value: ${e}`);
    }

    const result = schema.safeParse(valueObject);

    if (!result.success) {
      throw new Error(`Invalid setting value: ${result.error}`);
    }

    const value = result.data;

    await prisma.settingValue.upsert({
      where: { key },
      create: {
        key,
        value,
      },
      update: {
        value,
      },
    });

    // Some settings affect static pages, therefore we must regenerate them
    revalidateAllPages(ctx);
  }),
});
