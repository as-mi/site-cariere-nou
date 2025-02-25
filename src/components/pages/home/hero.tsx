import { TFunction } from "next-i18next";

import Image from "next/image";

import logoCariere from "~/images/logos/cariere-small-white.png";
// Replaced the background from "~/images/hero-background.jpg";
// Switched to a gradient background
import GradientBackground from "./addons/background";
import GalleryBackground from "./addons/gallery";
import Counter from "./addons/counter";

type HeroSectionProps = {
  t: TFunction;
  showComingSoonMessage: boolean;
  showEventsSectionLink: boolean;
};

const HeroSection: React.FC<HeroSectionProps> = ({
  t,
  showComingSoonMessage,
  showEventsSectionLink,
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();

    const anchorElement = event.target as HTMLAnchorElement;
    const link = anchorElement.href;
    const hashIndex = link.lastIndexOf("#");
    if (hashIndex < 0) {
      return;
    }

    const id = link.slice(hashIndex + 1);
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen bg-black pt-32 text-white md:pt-40 lg:pt-48"
    >
      {/* <GradientBackground></GradientBackground> */}
      <GalleryBackground src="./background.mp4"></GalleryBackground>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent opacity-80"></div>

      <div className="relative z-10 text-center -mt-10">
        <Image
          src={logoCariere}
          // Updated version (2025)
          alt="Cariere v14.0"
          className="mx-auto w-full max-w-[260px] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
          priority
          unoptimized
        />

        {/* This information is displayed everytime, no matter if event has started or not*/}
        <>
          <p className="mx-2 mt-8 font-display text-3xl font-medium">
            {t("heroSection.date")}
          </p>

          <p className="mx-2 mt-4 font-display text-2xl font-medium">
            {t("heroSection.faculty")}
          </p>
        </>

        {/*If the event has not started, the counter is displayed.*/}
        {showComingSoonMessage ? (
          <Counter t={t}></Counter>
        ) : (
          <p className="mt-12 font-display text-2xl text-white">
            {t("heroSection.end")}
          </p>
        )}

        {/*custom cursor*/}
        <div className="mx-auto mt-16 mb-8 inline-flex flex-col items-center justify-center gap-4 px-4 md:inline-flex md:flex-row">
          {showEventsSectionLink && (
            <a
              className="admin-button shadow-md"
              href="#events"
              onClick={handleClick}
            >
              {t("heroSection.events")}
            </a>
          )}

          <a className="button shadow-md" href="#about" onClick={handleClick}>
            {t("heroSection.about")}
          </a>

          <a
            className="button shadow-md"
            href="#partners"
            onClick={handleClick}
          >
            {t("heroSection.partners")}
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
