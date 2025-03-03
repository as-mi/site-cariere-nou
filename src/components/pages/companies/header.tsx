import classNames from "classnames";

import Image from "next/image";
import { PackageType } from "@prisma/client";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";

import CompanyLogo from "~/components/common/company-logo";

type SocialMediaLinkProps = {
  href: string;
  icon: IconProp;
  title: string;
  linkClassName?: string;
  iconClassName?: string;
};

const SocialMediaLink: React.FC<SocialMediaLinkProps> = ({
  href,
  icon,
  title,
  linkClassName,
  iconClassName,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={classNames(
      "mx-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-about p-1 text-center align-middle text-base text-black hover:bg-zinc-200 active:bg-zinc-300",
      linkClassName,
    )}
  >
    <span title={title}>
      <FontAwesomeIcon
        icon={icon}
        className={classNames("h-4 w-4", iconClassName)}
      />
    </span>
  </a>
);
///todo
type Company = {
  name: string;
  packageType: PackageType;
  logo: {
    id: number;
    width: number;
    height: number;
  };
  siteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  videoUrl?: string | null;
};

type HeaderProps = {
  company: Company;
};

function getPackageImage(packageType: PackageType): string {
  const packageImages: Record<PackageType, string> = {
    PLATINUM: "/images/PLATINUM.png",
    GOLD: "/images/GOLD.png",
    SILVER: "/images/SILVER.png",
    BRONZE: "/images/BRONZE.png",
  };

  return packageImages[packageType];
}
const Header: React.FC<HeaderProps> = ({ company }) => (
  <header className="flex bg-center flex-col items-center justify-center bg-about text-white left-0 right-0">
    <div className="mt-20">
      <Image
        src={getPackageImage(company.packageType)}
        alt={company.packageType}
        width={400}
        height={200}
      />
    </div>
    <div className="bg-white p-2 xs:mb-2">
      <CompanyLogo company={company} />
    </div>
    <h1 className="mb-2 font-display text-5xl sm:text-5xl">{company.name}</h1>
    <div className="mt-3 flex flex-wrap justify-center">
      {company.siteUrl && (
        <SocialMediaLink
          href={company.siteUrl}
          icon={faLink}
          title="Website Link"
          linkClassName="sm:hidden"
        />
      )}
      {company.instagramUrl && (
        <SocialMediaLink
          href={company.instagramUrl}
          icon={faInstagram}
          title="Instagram"
        />
      )}
      {company.facebookUrl && (
        <SocialMediaLink
          href={company.facebookUrl}
          icon={faFacebookF}
          title="Facebook"
        />
      )}
      {company.linkedinUrl && (
        <SocialMediaLink
          href={company.linkedinUrl}
          icon={faLinkedinIn}
          title="LinkedIn"
        />
      )}
    </div>
    {company.videoUrl && (
      <iframe
        className="relative w-96 h-80 pb-5 mt-5"
        src={company.videoUrl.replace("watch?v=", "embed/")}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    )}
    {company.siteUrl && (
      <h3 className="mt-3 hidden max-w-sm truncate text-center font-display text-lg sm:block">
        Link:{" "}
        <a
          href={company.siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-200 active:text-zinc-300"
        >
          {company.siteUrl}
        </a>
      </h3>
    )}
  </header>
);

export default Header;
