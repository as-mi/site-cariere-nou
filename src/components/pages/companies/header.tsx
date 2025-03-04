import classNames from "classnames";
import ReactPlayer from "react-player";
import { useEffect, useState } from "react";
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
const Header: React.FC<HeaderProps> = ({ company }) => {
  const [isClient, setIsClient] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set to true once the component is mounted on the client side
  }, []);

  return (
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
      <h1 className="mb-2 font-display text-4xl sm:text-5xl z-10">
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
      <div className="flex sm:flex-row justify-center items-center z-10 gap-4 flex-col mb-8 mt-8">
        {company.siteUrl && (
          <h3 className="max-w-sm text-center font-display text-lg sm:block">
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
        {company.videoUrl && (
          <div className="max-w-sm text-center font-display text-lg sm:block">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="button"
            >
              {isExpanded ? "Închide vizualizarea" : "Video de prezentare"}
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="py-4 px-5 bg-white bg-opacity-20 rounded-lg mb-5 z-10 w-full sm:w-3/4">
          {isClient && company.videoUrl && (
            <div className="relative pb-[56.25%] h-0 overflow-hidden w-full">
              <ReactPlayer
                className="absolute top-0 left-0 w-full h-full"
                url={company.videoUrl}
                controls
                width="100%"
                height="100%"
                playing
                playsinline
              />
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
