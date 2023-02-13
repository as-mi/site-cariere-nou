import { PHASE_PRODUCTION_BUILD } from "next/dist/shared/lib/constants";

import prisma from "~/lib/prisma";

import { SettingKeys, SETTINGS, SettingValueType } from ".";

export const getSettingValue = async <K extends SettingKeys>(
  key: K
): Promise<SettingValueType<K>> => {
  const setting = SETTINGS[key];

  let value;
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    // When statically building the production website,
    // we don't want to access the database.
    value = undefined;
  } else {
    const settingValue = await prisma.settingValue.findUnique({
      where: { key },
    });
    value = settingValue?.value ?? undefined;
  }

  const result = setting.schema.safeParse(value);

  if (!result.success) {
    console.error(`Parser error: ${result.error}`);
    throw new Error(`Failed to parse value for setting '${key}'`);
  }

  return result.data;
};
