import Link from "next/link";
import Image from "next/image";

import { TFunction } from "next-i18next";

import { PackageType } from "@prisma/client";

export type Logo = {
  id: number;
  width: number;
  height: number;
};

export type Company = {
  id: number;
  name: string;
  slug: string;
  logo: Logo;
};

export type CompaniesByPackageType = Partial<Record<PackageType, Company[]>>;

type PartnerLogoProps = {
  company: Company;
};

const PartnerLogo: React.FC<PartnerLogoProps> = ({
  company: { name, logo },
}) => (
  <Image
    src={`/api/images/${logo.id}`}
    width={logo.width}
    height={logo.height}
    alt={`Logo ${name}`}
    className="p-3"
  />
);
type PartnersSectionProps = {
  t: TFunction;
  companiesByPackageType: CompaniesByPackageType;
};

const PartnersSection: React.FC<PartnersSectionProps> = ({
  t,
  companiesByPackageType,
}) => (
  <section id="partners" className="bg-black px-3 py-16 text-white">
    <header className="mb-10">
      <h2 className="text-center font-display text-3xl font-bold uppercase">
        {t("partnersSection.title")}
      </h2>
    </header>
    {Object.keys(companiesByPackageType).length === 0 ? (
      <p className="mx-auto max-w-xs text-center text-xl sm:max-w-prose sm:py-10">
        {t("partnersSection.comingSoon")}
      </p>
    ) : (
      <div>
        {Object.entries(companiesByPackageType).map(
          ([packageType, companies]) => (
            <section key={packageType} className="mb-6">
              <header className="mb-6 text-center">
                <h3 className="border-b-solid inline-block border-b-2 border-b-white px-6 font-display text-3xl font-bold">
                  Parteneri {packageType}
                </h3>
              </header>
              <div className="flex flex-row flex-wrap justify-center space-x-8">
                {companies.map((company) => (
                  <div key={company.id} className="w-64 p-6">
                    <Link href={`/companies/${company.slug}`}>
                      <span className="block text-center font-display text-xl font-semibold">
                        {company.name}
                      </span>
                      <PartnerLogo company={company} />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )
        )}
      </div>
    )}
  </section>
);

export default PartnersSection;
