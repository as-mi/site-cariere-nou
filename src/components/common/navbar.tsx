import { useCallback, useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { useTranslation } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";

import logoCariereSmall from "~/images/logos/cariere-small-white.png";

export type RenderLinksParams = {
  showNavMenu: () => void;
  closeNavMenu: () => void;
};

export type NavBarProps = {
  renderLinks?: ({
    showNavMenu,
    closeNavMenu,
  }: RenderLinksParams) => JSX.Element | null;
  autoHideLogo?: boolean;
};

// Based on https://designcode.io/react-hooks-handbook-usescrollposition-hook
const useScrollPosition = (): number => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset);
    };
    window.addEventListener("scroll", updatePosition, { passive: true });
    updatePosition();
    return () => {
      window.removeEventListener("scroll", updatePosition);
    };
  }, []);

  return scrollPosition;
};

const NavBar: React.FC<NavBarProps> = ({ renderLinks, autoHideLogo }) => {
  const { t } = useTranslation("common");

  const [navMenuShown, setNavMenuShown] = useState(false);

  const showNavMenu = useCallback(() => setNavMenuShown(true), []);
  const closeNavMenu = useCallback(() => setNavMenuShown(false), []);

  const links = useMemo(
    () => renderLinks!({ showNavMenu, closeNavMenu }),
    [renderLinks, showNavMenu, closeNavMenu],
  );

  const scrollPosition = useScrollPosition();
  const scrolled = scrollPosition > 200;

  return (
    <header className="fixed z-30 flex w-full items-center bg-black px-2 py-3 text-white">
      <div>
        <Image
          src={logoCariereSmall}
          alt="Logo Cariere"
          width={98}
          height={40}
          // TODO: need to determine why Next.js's built-in compression algorithm
          // makes this image look very blurry
          unoptimized
          className={`opacity-0 transition-opacity duration-500 ${
            !autoHideLogo || scrolled ? "opacity-100" : "invisible"
          }`}
        />
      </div>
      <button
        onClick={showNavMenu}
        className={`ml-auto mr-3 ${navMenuShown ? "hidden" : ""} md:hidden`}
      >
        <span title={t("navbar.show") || undefined}>
          <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
        </span>
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
            <ul>{links}</ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar;

NavBar.defaultProps = {
  renderLinks: () => null,
  autoHideLogo: true,
};
