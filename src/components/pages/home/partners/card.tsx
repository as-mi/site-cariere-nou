import classNames from "classnames";

import Link from "next/link";

import { PackageType } from "@prisma/client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";

import CompanyLogo, { CompanyWithLogo } from "~/components/common/company-logo";

export type Company = { name: string; slug: string } & CompanyWithLogo;

type PartnerCardProps = {
  packageType: PackageType;
  company: Company;
};

const MEDAL_COLORS = {
  [PackageType.GOLD]: "text-yellow-300",
  [PackageType.SILVER]: "text-zinc-400",
  [PackageType.BRONZE]: "text-amber-600",
};

const PartnerCard: React.FC<PartnerCardProps> = ({ packageType, company }) => (
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

export default PartnerCard;
