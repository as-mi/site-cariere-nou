import { TFunction } from "next-i18next";

import { PackageType } from "@prisma/client";

import PartnerCard, { Company as PartnerCardCompany } from "./card";

export type Company = {
  id: number;
} & PartnerCardCompany;

type PartnersSectionSubsectionProps = {
  t: TFunction;
  packageType: PackageType;
  companies: Company[];
};

const PartnersSectionSubsection: React.FC<PartnersSectionSubsectionProps> = ({
  t,
  packageType,
  companies,
}) => (
  <section>
    <header className="mb-6 text-center">
      <h3 className="xs:border-b-solid inline-block px-6 font-display text-3xl font-bold xs:border-b-2 xs:border-b-white">
        {t("partnersSection.subsectionHeader", { packageType })}
      </h3>
    </header>
    <div className="flex flex-row flex-wrap justify-center gap-4">
      {companies.map((company) => (
        <PartnerCard
          key={company.id}
          packageType={packageType}
          company={company}
        />
      ))}
    </div>
  </section>
);

export default PartnersSectionSubsection;
