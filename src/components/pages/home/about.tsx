import Image from "next/image";

import aboutUsImage from "../../../images/about-us.png";

type AboutSectionProps = { t: any };

const AboutSection: React.FC<AboutSectionProps> = ({ t }) => (
  <section id="about" className="bg-white px-3 py-16">
    <header className="mb-10">
      <h2 className="text-center font-display text-2xl font-bold uppercase text-green-800">
        {t("aboutSection.title")}
      </h2>
    </header>
    <div className="flex flex-wrap items-center justify-center">
      <section className="bg-zinc-100 p-10 md:max-w-sm lg:max-w-prose">
        <h3 className="mb-2 font-display text-2xl font-bold text-green-800">
          {t("aboutSection.objectives")}
        </h3>
        <p>{t("aboutSection.description")}</p>
      </section>
      <Image
        src={aboutUsImage}
        alt=""
        className="mt-10 w-full max-w-[300px] sm:max-w-[400px] md:mx-5 md:max-w-xs lg:max-w-sm"
      />
    </div>
  </section>
);

export default AboutSection;
