import { TFunction } from "next-i18next";

import { PackageType } from "@prisma/client";

import Image from "next/image";
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
  <section
    className="mx-0 px-0 bg-repeat-y bg-cover bg-center"
    style={{
      background: `linear-gradient(to bottom, #00000000 0%, ${t(
        "partnersColors." + packageType,
      )} 50%, #00000000 100%)`,
    }}
  >
    <header className="pt-4 pb-2 flex text-center items-center justify-center selection:bg-transparent">
      <Image
        src={`/images/${t("partnersSection.subsectionHeader", {
          packageType,
        })}.png`}
        alt={packageType}
        width={500}
        height={300}
      />
    </header>

    <div className="flex flex-row flex-wrap justify-center gap-4 px-4 sm:gap-6">
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
