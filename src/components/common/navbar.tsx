import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

import homepage from "~/pages/index";

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
  home?: boolean;
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

const NavBar: React.FC<NavBarProps> = ({ renderLinks, autoHideLogo, home }) => {
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
  const top = scrollPosition < 180;

  return (
    <header
      className={`fixed z-30 flex w-full items-center px-2 py-3 text-white left-0 top-0`}
    >
      <span
        className={`absolute z-0 w-full h-full bg-cover bg-navbar bg-no-repeat bg-center px-2 py-3 ml-0 mt-0 top-0 left-0 opacity-95
          ${
            home
              ? `${scrolled ? "animate-bg-fade-in" : "animate-bg-fade-out"}`
              : ""
          }
        `}
      ></span>

      <a
        href="/"
        className={` z-30 ml-2 sm:ml-5 ${
          home
            ? `opacity-0 transition-opacity duration-500 ${
                !autoHideLogo || scrolled ? "opacity-100" : "opacity-0"
              } ${top ? "hidden" : "visible"}`
            : ""
        }`}
      >
        <Image
          src={logoCariereSmall}
          alt="Logo Cariere v14"
          width={100}
          height={40}
          // TODO: need to determine why Next.js's built-in compression algorithm
          // makes this image look very blurry
          unoptimized
          className={`${
            home
              ? `opacity-0 transition-opacity duration-500 ${
                  !autoHideLogo || scrolled ? "opacity-100" : "opacity-0"
                }`
              : ""
          }`}
        />
      </a>

      <button
        onClick={showNavMenu}
        className={`z-30 ml-auto mr-3 ${
          navMenuShown ? "hidden" : ""
        } sc:hidden`}
      >
        <span title={t("navbar.show") || undefined}>
          <FontAwesomeIcon icon={faBars} className="h-6 w-6 z-30" />
        </span>
      </button>
      <div
        className={`${navMenuShown ? "" : "hidden"} sc:ml-auto sc:block z-30`}
      >
        <div className="absolute left-0 top-0 z-40 h-screen w-screen bg-slate-700 bg-opacity-60 sc:hidden"></div>
        <div className="absolute left-0 top-0 z-50 flex h-screen w-screen flex-col px-3 py-5 sc:static sc:h-auto sc:w-auto sc:p-0">
          <button
            onClick={closeNavMenu}
            className="ml-auto mr-2 mb-3 sc:hidden"
          >
            <span title={t("navbar.close") || undefined}>
              <FontAwesomeIcon icon={faClose} className="h-6 w-6 z-30" />
            </span>
          </button>
          <nav className="h-full rounded-lg bg-white py-2 text-black sc:bg-transparent sc:py-0 sc:text-inherit">
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
