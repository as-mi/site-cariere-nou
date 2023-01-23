import { TFunction } from "next-i18next";

import Image from "next/image";

import background from "../../../images/hero-background.jpg";
import logoCariere from "../../../images/logos/cariere-white.png";

type HeroSectionProps = {
  t: TFunction;
};

const HeroSection: React.FC<HeroSectionProps> = ({ t }) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();

    const aboutSection = document.getElementById("about");

    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen bg-black pt-32 text-white md:pt-40 lg:pt-48">
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

        <p className="mx-auto mt-16 max-w-sm px-3 text-lg">{t("teaser")}</p>

        <a
          className="mt-16 inline-block rounded-full bg-white px-5 py-2 font-medium text-black"
          href="#about"
          onClick={handleClick}
        >
          {t("about")}
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
