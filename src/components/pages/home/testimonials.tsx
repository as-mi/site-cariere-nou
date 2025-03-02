import React from "react";
import { TFunction } from "next-i18next";
import GradientBackground from "./addons/background";

interface TestimonialsProps {
  t: TFunction;
}

const Testimonials: React.FC<TestimonialsProps> = ({ t }) => {
  return (
    <section
      id="testimonials"
      className="relative z-10 bg-partners text-white pb-10"
    >
      <canvas
        id="testimonials-background"
        className="z-0 w-full h-full absolute top-0 left-0 opacity-40"
      ></canvas>
      <GradientBackground cvid="testimonials-background"></GradientBackground>
      <div className="relative z-10">
        <div className="relative z-10 bg-gradient-to-t from-transparent to-white pt-10 h-36 mb-5" />
        <header className="mb-10 z-10">
          <h2 className="z-10 text-center font-display text-2xl font-bold uppercase xs:text-3xl sm:text-4xl md:text-5xl mb-2">
            {t("testimonials.title")}
          </h2>
          <h4 className="text-center font-display text-l font-bold xs:text-xl sm:text-2xl md:text-3xl mb-10">
            2024
          </h4>
        </header>

        <div className="sm:flex flex-col items-center gap-10 z-10">
          <div className="flex flex-col sm:flex-row items-center sm:w-3/5 mb-10 gap-4 sm:ml-0 sm:mr-0 mr-4 ml-4">
            <div className="bg-white rounded-full h-fit w-fit">
              <p className="p-4 text-black font-display uppercase font-bold">
                Carlo
              </p>
            </div>
            <div className="w-full bg-green-300 bg-opacity-20 text-white rounded-lg shadow-2xl mr-4 ml-4 sm:mr-0 sm:ml-0">
              <p className="italic p-4 text-l text-justify sm:text-xl sm:text-pretty">
                {t("testimonials.carlo")}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row items-center sm:w-3/5 mb-10 gap-4 sm:ml-0 sm:mr-0 mr-4 ml-4">
            <div className="w-full bg-green-300 bg-opacity-20 text-white rounded-lg shadow-2xl mr-4 ml-4 sm:mr-0 sm:ml-0">
              <p className="text-l text-justify italic p-4 sm:text-xl sm:text-pretty">
                {t("testimonials.mihai")}
              </p>
            </div>
            <div className="bg-white rounded-full h-fit w-fit">
              <p className="p-4 text-black font-display uppercase font-bold">
                Mihai
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:w-3/5 mb-10 gap-4 sm:ml-0 sm:mr-0 mr-4 ml-4">
            <div className="bg-white rounded-full h-fit w-fit">
              <p className="p-4 text-black font-display uppercase font-bold">
                Anca
              </p>
            </div>
            <div className="w-full bg-green-300 bg-opacity-20 text-white rounded-lg shadow-2xl mr-4 ml-4 sm:mr-0 sm:ml-0">
              <p className="text-l text-justify italic p-4 sm:text-xl sm:text-pretty">
                {t("testimonials.anca")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
