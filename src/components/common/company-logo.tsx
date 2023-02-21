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

type CompanyWithLogo = Prisma.CompanyGetPayload<typeof companyWithLogo>;

type CompanyLogoProps = {
  company: CompanyWithLogo;
  className?: string;
};

const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company: { name: companyName, logo },
  className,
}) => {
  const { t } = useTranslation("common");
  return (
    <Image
      src={`http://localhost:${process.env.PORT ?? 3000}/api/images/${logo.id}`}
      width={logo.width}
      height={logo.height}
      alt={t("companyLogo", { companyName })}
      className={className}
    />
  );
};

export default CompanyLogo;
