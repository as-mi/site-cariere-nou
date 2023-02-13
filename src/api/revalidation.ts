import { Context } from "./trpc/context";

export const revalidateHomePage = async (ctx: Context) => {
  await ctx.revalidate("/");
};

export const revalidateCompanyPage = async (ctx: Context, slug: string) => {
  // TODO: currently broken, because we dynamically generate companies' pages
  //await ctx.revalidate(`/companies/${slug}`);
};
