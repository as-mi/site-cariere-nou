import { NextApiResponse } from "next";

export const revalidateHomePage = async (res: NextApiResponse) => {
  await res.revalidate("/");
};

export const revalidateCompanyPage = async (
  res: NextApiResponse,
  slug: string
) => {
  // TODO: currently broken, because we dynamically generate companies' pages
  //await res.revalidate(`/companies/${slug}`);
};
