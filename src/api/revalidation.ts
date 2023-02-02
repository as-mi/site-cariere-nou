import { NextApiResponse } from "next";

export const revalidateHomePage = async (res: NextApiResponse) => {
  await res.revalidate("/");
};

export const revalidateCompanyPage = async (
  res: NextApiResponse,
  slug: string
) => {
  await res.revalidate(`/companies/${slug}`);
};
