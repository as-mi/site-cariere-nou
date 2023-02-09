import _ from "lodash";

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
  t: TFunction;
  company: Company;
  className?: string;
};

const PartnerLogo: React.FC<PartnerLogoProps> = ({
  t,
  company: { name, logo },
  className,
}) => (
  <Image
    src={`/api/images/${logo.id}`}
    width={logo.width}
    height={logo.height}
    alt={t("partnersSection.logo", { partnerName: name })}
    className={className}
  />
);

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
        <div
          key={company.id}
          className="min-h-[12rem] w-64 p-2 xs:p-4 sm:p-8 md:min-h-[18rem] md:w-80 lg:min-h-[22rem] lg:w-96"
        >
          <Link
            href={`/companies/${company.slug}`}
            className="flex h-full flex-col"
          >
            <span className="block text-center font-display text-2xl font-semibold">
              {company.name}
            </span>
            <PartnerLogo t={t} company={company} className="my-auto p-3" />
          </Link>
        </div>
      ))}
    </div>
  </section>
);

type PartnersSectionProps = {
  t: TFunction;
  companiesByPackageType: CompaniesByPackageType;
};

const PACKAGE_TYPES_IN_DESCENDING_ORDER = [
  PackageType.GOLD,
  PackageType.SILVER,
  PackageType.BRONZE,
];

const PartnersSection: React.FC<PartnersSectionProps> = ({
  t,
  companiesByPackageType,
}) => (
  <section
    id="partners"
    className="bg-black px-3 py-16 text-white sm:py-20 md:py-28"
  >
    <header className="mb-10">
      <h2 className="text-center font-display text-2xl font-bold uppercase xs:text-3xl sm:text-4xl md:text-5xl">
        {t("partnersSection.title")}
      </h2>
    </header>
    {_.isEmpty(companiesByPackageType) ? (
      <div className="text-md mx-auto max-w-xs space-y-4 text-center xs:text-lg sm:max-w-lg sm:space-y-8 sm:py-10 sm:text-xl md:text-2xl">
        <p>{t("partnersSection.comingSoon")}</p>
        <p>{t("partnersSection.followOurSocialMediaPages")}</p>
      </div>
    ) : (
      <div className="space-y-10">
        {PACKAGE_TYPES_IN_DESCENDING_ORDER.map((packageType) => ({
          packageType,
          companies: companiesByPackageType[packageType],
        }))
          .filter(({ companies }) => !!companies)
          .map(({ packageType, companies }, index) => (
            <PartnersSectionSubsection
              key={index}
              t={t}
              packageType={packageType}
              companies={companies!}
            />
          ))}
      </div>
    )}
  </section>
);

export default PartnersSection;
