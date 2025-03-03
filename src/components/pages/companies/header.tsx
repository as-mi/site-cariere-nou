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
import GradientBackground from "../home/addons/background";

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
      "mx-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black p-1 text-center align-middle text-base text-white hover:bg-green-800 active:bg-zinc-300",
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
  <header className="relative flex flex-col items-center justify-center bg-partners bg-no-repeat bg-center bg-cover text-white h-full">
    <canvas
      id="slug-background"
      className="absolute z-0 w-full h-full top-0 left-0 opacity-30"
    ></canvas>
    <GradientBackground cvid="slug-background" />

    {/* bg-frame around CompanyLogo */}
    <div className="pt-10 flex justify-center pm-3 z-10">
      <div className="bg-frame bg-center bg-cover bg-no-repeat p-8 w-full max-w-xs">
        <CompanyLogo
          company={company}
          className="p-4 w-auto h-65 min-w-65 max-h-65"
        />
      </div>
    </div>
    <h1 className="mb-2 font-display text-5xl sm:text-5xl z-10">
      {company.name}
    </h1>
    <div className="z-10 mt-5">
      <Image
        src={getPackageImage(company.packageType)}
        alt={company.packageType}
        width={300}
        height={200}
      />
    </div>

    <div className="mt-3 flex flex-wrap z-10">
      {/* {company.siteUrl && (
        <SocialMediaLink
          href={company.siteUrl}
          icon={faLink}
          title="Website Link"
          linkClassName="sm:hidden"
        />
      )} */}
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
    <div className="flex flex-row justify-center items-center z-10">
      {company.siteUrl && (
        <h3 className="mt-3 max-w-sm text-center font-display text-lg sm:block mb-8">
          <a
            href={company.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button"
          >
            Pagina companiei
          </a>
        </h3>
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
  </header>
);

export default Header;
