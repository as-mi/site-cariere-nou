import _ from "lodash";
import Link from "next/link";
import { TFunction } from "next-i18next";
import { PackageType } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useIsAdmin } from "~/hooks/use-role";
import OldPartnersSectionSubsection, { Company } from "./subsection";

export type { Company };

export type CompaniesByPackageType = Partial<Record<PackageType, Company[]>>;

type PartnersSectionProps = {
  t: TFunction;
  showOldCompanies: boolean;
  companiesByPackageType: CompaniesByPackageType;
};

const PACKAGE_TYPES_IN_DESCENDING_ORDER = [
  PackageType.PLATINUM,
  PackageType.GOLD,
  PackageType.SILVER,
  PackageType.BRONZE,
];

const OldPartnersSection: React.FC<PartnersSectionProps> = ({
  t,
  showOldCompanies: showOldCompanies,
  companiesByPackageType,
}) => {
  showOldCompanies ||= _.isEmpty(companiesByPackageType);

  const isAdmin = useIsAdmin();

  return (
    <section
      id="partners"
      className="bg-partners bg-no-repeat bg-center bg-cover text-white"
    >
      <div className="bg-gradient-to-t from-transparent to-white mt-12 h-36" />
      <header className="mb-10">
        <h2 className="text-center font-display text-2xl font-bold uppercase xs:text-3xl sm:text-4xl md:text-5xl">
          {t("partnersSection.title")}
        </h2>
      </header>
      {!showOldCompanies ? (
        <div className="text-md mx-auto max-w-xs space-y-4 text-center xs:text-lg sm:max-w-lg sm:space-y-8 sm:py-10 sm:text-xl md:text-2xl">
          <p>{t("partnersSection.comingSoon")}</p>
          <p>{t("partnersSection.followOurSocialMediaPages")}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {PACKAGE_TYPES_IN_DESCENDING_ORDER.map((packageType) => {
            const companies = companiesByPackageType[packageType];
            if (!companies) return null;

            // Filter out companies where `thisYearPartner` is false
            const filteredCompanies = companies.filter(
              (company) => !company.thisYearPartner,
            );

            // Only render if there are companies left after filtering
            if (filteredCompanies.length === 0) return null;
            return (
              <OldPartnersSectionSubsection
                key={packageType}
                t={t}
                packageType={packageType}
                companies={filteredCompanies}
              />
            );
          })}
        </div>
      )}
      {isAdmin && (
        <div className="mx-auto mt-10 flex max-w-md flex-row justify-center">
          <Link href="/admin/companies/new" className="admin-button">
            <FontAwesomeIcon
              icon={faPlus}
              className="mr-2 inline-block h-4 w-4"
            />
            {t("partnersSection.addPartner")}
          </Link>
        </div>
      )}
    </section>
  );
};

export default OldPartnersSection;
