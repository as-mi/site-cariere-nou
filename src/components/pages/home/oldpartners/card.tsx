import { useCallback } from "react";
import classNames from "classnames";

import Link from "next/link";

import { PackageType } from "@prisma/client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";

import usePreviousPageStore from "~/hooks/use-previous-page-store";

import CompanyLogo, { CompanyWithLogo } from "~/components/common/company-logo";

export type Company = { name: string; slug: string } & CompanyWithLogo;

type PartnerCardProps = {
  packageType: PackageType;
  company: Company;
};

const MEDAL_COLORS = {
  [PackageType.PLATINUM]: "text-slate-500",
  [PackageType.GOLD]: "text-yellow-300",
  [PackageType.SILVER]: "text-zinc-400",
  [PackageType.BRONZE]: "text-amber-600",
};

const OldPartnerCard: React.FC<PartnerCardProps> = ({
  packageType,
  company,
}) => {
  const { setPreviousPage } = usePreviousPageStore();

  const onClick = useCallback(() => {
    // Record that this was the previous page in the Zustand store
    // to allow the company page's home button to perform scroll restoration
    setPreviousPage("/");
  }, [setPreviousPage]);

  return (
    <div className="rounded-md bg-white items-center justify-items-center">
      <Link
        href={`/companies/${company.slug}`}
        onClick={onClick}
        className="flex h-full w-full max-w-xl flex-col items-center gap-4 p-4"
      >
        <div className="max-w-xs p-4 sm:w-2/4 sm:max-w-full">
          <CompanyLogo company={company} className="my-auto" />
        </div>
      </Link>
    </div>
  );
};

export default OldPartnerCard;
