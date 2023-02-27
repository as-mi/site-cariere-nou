import classNames from "classnames";

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
      "mx-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white p-1 text-center align-middle text-base text-black hover:bg-zinc-200 active:bg-zinc-300",
      linkClassName
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
};

type HeaderProps = {
  company: Company;
};

const Header: React.FC<HeaderProps> = ({ company }) => (
  <header className="flex flex-col items-center justify-center bg-black py-8 text-white sm:py-12 md:py-20">
    <div className="mx-10 mb-8 max-w-sm rounded-lg bg-white p-4 xs:mb-12 xs:p-8 sm:mb-16 sm:p-12">
      <CompanyLogo company={company} />
    </div>
    <h1 className="mb-2 font-display text-3xl sm:text-5xl">{company.name}</h1>
    <h2 className="font-display text-xl">Partener {company.packageType}</h2>

    <div className="mt-3 flex flex-wrap">
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
