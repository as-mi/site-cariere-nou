import { useState } from "react";
import { useTranslation } from "next-i18next";

import Image from "next/image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";

import logoCariereSmall from "../../../images/logos/cariere-small-white.png";

const NavBar: React.FC = () => {
  const { t } = useTranslation("home");

  const [navMenuShown, setNavMenuShown] = useState(false);

  const showNavMenu = () => {
    setNavMenuShown(true);
  };

  const closeNavMenu = () => {
    setNavMenuShown(false);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const anchorElement = e.target as HTMLAnchorElement;
    const link = anchorElement.href;
    const hashIndex = link.lastIndexOf("#");

    if (hashIndex === -1) {
      console.error("Could not find hash in link: %s", link);
      return;
    }

    const targetId = link.substring(hashIndex + 1);
    const element = document.getElementById(targetId);

    if (element) {
      closeNavMenu();
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const links = [
    { targetId: "hero", label: t("navbar.home") },
    { targetId: "about", label: t("navbar.about") },
    { targetId: "partners", label: t("navbar.partners") },
    { targetId: "contact", label: t("navbar.contact") },
  ];

  return (
    <header className="fixed z-20 flex w-full items-center bg-black px-2 py-3 text-white">
      <div>
        <Image
          src={logoCariereSmall}
          alt="Logo Cariere"
          width={98}
          height={40}
          // TODO: need to determine why Next.js's built-in compression algorithm
          // makes this image look very blurry
          unoptimized
        />
      </div>
      <button
        onClick={showNavMenu}
        className={`ml-auto mr-3 ${navMenuShown ? "hidden" : ""} md:hidden`}
      >
        <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
      </button>
      <div className={`${navMenuShown ? "" : "hidden"} md:ml-auto md:block`}>
        <div className="absolute left-0 top-0 z-40 h-screen w-screen bg-slate-700 bg-opacity-60 md:hidden"></div>
        <div className="absolute left-0 top-0 z-50 flex h-screen w-screen flex-col px-3 py-5 md:static md:h-auto md:w-auto md:p-0">
          <button
            onClick={closeNavMenu}
            className="ml-auto mr-2 mb-3 md:hidden"
          >
            <span title={t("navbar.close") || undefined}>
              <FontAwesomeIcon icon={faClose} className="h-6 w-6" />
            </span>
          </button>
          <nav className="h-full rounded-lg bg-white py-2 text-black md:bg-transparent md:py-0 md:text-inherit">
            <ul>
              {links.map(({ targetId, label }, index) => (
                <li key={index} className="md:inline-block">
                  <a
                    onClick={handleLinkClick}
                    href={`#${targetId}`}
                    className="block px-5 py-3"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar;