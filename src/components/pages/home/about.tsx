import Image from "next/image";

import aboutUsImage from "../../../images/about-us.png";
import GradientBackground from "./addons/background";
import Postcards from "./addons/about-postcards";

type AboutSectionProps = { t: any };

const AboutSection: React.FC<AboutSectionProps> = ({ t }) => (
  <section id="about" className="bg-about bg-no-repeat bg-cover bg-center">
    <div className="z-10 absolute left-0 w-full h-1/6 bg-gradient-to-b from-zinc-100 to-transparent"></div>
    <div className="bg-aboutstars bg-no-repeat bg-cover bg-center w-full m-0 pb-10 left-0 right-0 relative">
      <canvas
        id="about-background"
        className="z-0 w-full h-full absolute top-0 left-0 opacity-40"
      ></canvas>
      <GradientBackground cvid="about-background"></GradientBackground>
      <h2 className="z-1 text-center font-display relative pt-28 mt-12 text-3xl mb-4 font-bold uppercase text-white ml-4 mr-4">
        {t("aboutSection.about")}
      </h2>

      <div className="flex flex-wrap items-center justify-center">
        <section className="z-10 mt-6 lg:max-w-prose text-xl text-justify ml-12 mr-12">
          <p className="text-white">
            <span className="text-white italic font-medium">
              {`${t("aboutSection.eventTitle")} `}
            </span>
            {t("aboutSection.eventDescription1")}
          </p>
          <br></br>
          <p className="text-white">{t("aboutSection.eventDescription2")}</p>
        </section>
      </div>

      <h2 className="text-center font-display relative mt-20 text-3xl mb-4 font-bold uppercase text-white ml-4 mr-4">
        {t("aboutSection.partners")}
      </h2>

      <div className="flex flex-wrap items-center justify-center">
        <section className="z-10 mt-6 lg:max-w-prose text-xl text-justify ml-12 mr-12">
          <p className="text-white">{t("aboutSection.partnersDescription")}</p>
        </section>
      </div>

      <h2 className="text-center font-display relative mt-20 text-3xl mb-10 font-bold uppercase text-white">
        {t("aboutSection.projectManagers")}
      </h2>

      <Postcards t={t}></Postcards>
      <div className="z-10 left-0 w-full h-16 mb-0 bottom-0 bg-gradient-to-b from-transparent to-black absolute mt-10"></div>
    </div>
  </section>
);

export default AboutSection;
