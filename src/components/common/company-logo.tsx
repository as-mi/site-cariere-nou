import { useTranslation } from "next-i18next";

import { Prisma } from "@prisma/client";

import UploadedImage from "./uploaded-image";

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
    <UploadedImage
      imageId={logo.id}
      width={200}
      height={200}
      queryString={queryString}
      alt={t("companyLogo", { companyName })}
      className={className}
    />
  );
};

export default CompanyLogo;
