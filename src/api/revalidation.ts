import prisma from "~/lib/prisma";

import { Context } from "./trpc/context";

export const revalidateHomePage = async (ctx: Context) => {
  await ctx.revalidate("/");
};

export const revalidateCompanyPage = async (ctx: Context, slug: string) => {
  // TODO: currently broken, because we dynamically generate companies' pages
  //await ctx.revalidate(`/companies/${slug}`);
};

export const revalidateAllPages = async (ctx: Context) => {
  await revalidateHomePage(ctx);

  const companies = await prisma.company.findMany({
    select: {
      slug: true,
    },
  });
  for (const company of companies) {
    await revalidateCompanyPage(ctx, company.slug);
  }
};
