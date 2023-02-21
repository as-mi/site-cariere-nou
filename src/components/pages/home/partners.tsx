import _ from "lodash";
import classNames from "classnames";

import Link from "next/link";

import { TFunction } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal, faPlus } from "@fortawesome/free-solid-svg-icons";

import { PackageType } from "@prisma/client";

import { useIsAdmin } from "~/hooks/use-role";

import CompanyLogo from "~/components/common/company-logo";

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

type PartnerCardProps = {
  t: TFunction;
  packageType: PackageType;
  company: Company;
};

const MEDAL_COLORS = {
  [PackageType.GOLD]: "text-yellow-300",
  [PackageType.SILVER]: "text-zinc-400",
  [PackageType.BRONZE]: "text-amber-600",
};

const PartnerCard: React.FC<PartnerCardProps> = ({
  t,
  packageType,
  company,
}) => (
  <div className="rounded-md bg-white">
    <Link
      href={`/companies/${company.slug}`}
      className="flex h-full w-full max-w-xl flex-row items-center py-8 px-8 pt-10"
    >
      <div className="w-2/4">
        <CompanyLogo company={company} className="my-auto" />
      </div>
      <div className="w-2/4 content-center pl-6 text-black">
        <span className="block font-display text-xl font-bold">
          {company.name}
        </span>
        <hr />
        <span className="mt-6 block">
          <FontAwesomeIcon
            icon={faMedal}
            className={classNames(
              "mr-3 inline-block h-4 w-4",
              MEDAL_COLORS[packageType]
            )}
          />
          Partener{" "}
          {packageType.charAt(0).toUpperCase() +
            packageType.toLowerCase().slice(1)}
        </span>
      </div>
    </Link>
  </div>
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
        <PartnerCard
          key={company.id}
          t={t}
          packageType={packageType}
          company={company}
        />
      ))}
    </div>
  </section>
);

type PartnersSectionProps = {
  t: TFunction;
  showComingSoonMessage: boolean;
  companiesByPackageType: CompaniesByPackageType;
};

const PACKAGE_TYPES_IN_DESCENDING_ORDER = [
  PackageType.GOLD,
  PackageType.SILVER,
  PackageType.BRONZE,
];

const PartnersSection: React.FC<PartnersSectionProps> = ({
  t,
  showComingSoonMessage,
  companiesByPackageType,
}) => {
  showComingSoonMessage ||= _.isEmpty(companiesByPackageType);

  const isAdmin = useIsAdmin();

  return (
    <section
      id="partners"
      className="bg-black px-3 py-16 text-white sm:py-20 md:py-28"
    >
      <header className="mb-10">
        <h2 className="text-center font-display text-2xl font-bold uppercase xs:text-3xl sm:text-4xl md:text-5xl">
          {t("partnersSection.title")}
        </h2>
      </header>
      {showComingSoonMessage ? (
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
      {isAdmin && (
        <div className="mx-auto mt-10 flex max-w-md flex-row justify-center">
          <Link
            href="/admin/companies/new"
            className="inline-block rounded-md bg-blue-700 px-3 py-2 text-white hover:bg-blue-800 active:bg-blue-900"
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="mr-2 inline-block h-4 w-4"
            />
            Adaugă o companie nouă
          </Link>
        </div>
      )}
    </section>
  );
};

export default PartnersSection;
