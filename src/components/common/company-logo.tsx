import Image from "next/image";

import { useTranslation } from "next-i18next";

import { Prisma } from "@prisma/client";

const companyWithLogo = Prisma.validator<Prisma.CompanyArgs>()({
  select: {
    name: true,
    logo: {
      select: {
        id: true,
        width: true,
        height: true,
      },
    },
  },
});

export type CompanyWithLogo = Prisma.CompanyGetPayload<typeof companyWithLogo>;

type CompanyLogoProps = {
  company: CompanyWithLogo;
  queryString?: string;
  className?: string;
};

const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company: { name: companyName, logo },
  queryString,
  className,
}) => {
  const { t } = useTranslation("common");
  return (
    <Image
      src={`http://localhost:${process.env.PORT ?? 3000}/api/images/${logo.id}${
        queryString ? `?${queryString}` : ""
      }`}
      width={logo.width}
      height={logo.height}
      alt={t("companyLogo", { companyName })}
      className={className}
    />
  );
};

export default CompanyLogo;
