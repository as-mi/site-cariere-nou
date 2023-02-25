import { TFunction } from "next-i18next";

import Image from "next/image";

import background from "~/images/hero-background.jpg";
import logoCariere from "~/images/logos/cariere-white.png";

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
      <Image
        alt=""
        aria-hidden
        src={background}
        placeholder="blur"
        quality={100}
        fill
        sizes="100vw"
        className="z-0 object-cover"
        // TODO: this image is pretty high-resolution,
        // but Next.js's implicit compression makes it pretty blurry.
        // We should try finding a compromise between performance and quality.
        unoptimized
      />
      <div className="relative z-10 text-center">
        {/** TODO: replace with Cariere v12 logo */}
        <Image
          src={logoCariere}
          alt="Cariere v12.0"
          className="mx-auto w-full max-w-[260px] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
          priority
        />

        {showComingSoonMessage ? (
          <>
            <p className="mt-12 font-display text-xl text-gray-400">
              {t("heroSection.comingSoon")}
            </p>

            <p className="mx-2 mt-8 font-display text-3xl">
              {t("heroSection.date")}
            </p>

            <p className="mx-auto mt-16 max-w-sm px-3 text-lg">
              {t("heroSection.teaser")}
            </p>
          </>
        ) : (
          <p className="mx-auto mt-16 max-w-sm px-3 text-xl">
            {t("heroSection.welcome")}
          </p>
        )}

        <div className="mx-auto mt-16 mb-8 inline-flex flex-row flex-wrap items-center justify-center gap-4 px-4">
          <a
            className="inline-block rounded-full bg-white px-5 py-2 font-medium text-black hover:bg-zinc-100 active:bg-zinc-200"
            href="#about"
            onClick={handleClick}
          >
            {t("heroSection.about")}
          </a>

          <a
            className="inline-block rounded-full bg-white px-5 py-2 font-medium text-black hover:bg-zinc-100 active:bg-zinc-200"
            href="#partners"
            onClick={handleClick}
          >
            {t("heroSection.partners")}
          </a>

          {showEventsSectionLink && (
            <a
              className="inline-block rounded-full bg-white px-5 py-2 font-medium text-black hover:bg-zinc-100 active:bg-zinc-200"
              href="#events"
              onClick={handleClick}
            >
              {t("heroSection.events")}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
