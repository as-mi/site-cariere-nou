import _ from "lodash";

import Link from "next/link";
import { TFunction } from "next-i18next";

import { PackageType } from "@prisma/client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { useIsAdmin } from "~/hooks/use-role";

import PartnersSectionSubsection, { Company } from "./subsection";

export type { Company };

export type CompaniesByPackageType = Partial<Record<PackageType, Company[]>>;

type PartnersSectionProps = {
  t: TFunction;
  showComingSoonMessage: boolean;
  companiesByPackageType: CompaniesByPackageType;
};

const PACKAGE_TYPES_IN_DESCENDING_ORDER = [
  PackageType.PLATINUM,
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
