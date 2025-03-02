/*


”Un proiect deosebit de util, fără care nu aș fi aflat informații relevante pentru angajare” - Carlo 

”Experiența mea la târgul de cariere a fost una foarte pozitivă.
Am apreciat implicarea voluntarilor, organizarea bună și eficientă, comunicarea promptă ce au facilitat accesul la următorul tău job.
Consider că acest eveniment este unul vital în perioada de dezvoltare profesională a oricărui student din FMI, usurând cu mult interacțiunea cu posibilii angajatori din domeniul IT.” - Mihai

”Am fost angajată la Amiq, firmă de care am aflat la Cariere.
Cariere este un eveniment foarte util pentru studenți, am aflat de multe companii pe care nu le cunoșteam și am putut afla de joburi disponibile vorbind direct cu angajați ai companiei.” - Anca


*/

import React from "react";
import { TFunction } from "next-i18next";

interface TestimonialsProps {
  t: TFunction;
}

const Testimonials: React.FC<TestimonialsProps> = ({ t }) => {
  return (
    <section
      id="testimonials"
      className="relative z-10 bg-partners text-white pb-10"
    >
      <div className="relative bg-gradient-to-t from-transparent to-white pt-10 h-36 mb-5" />
      <header className="mb-10">
        <h2 className="text-center font-display text-2xl font-bold uppercase xs:text-3xl sm:text-4xl md:text-5xl mb-2">
          {t("testimonials.title")}
        </h2>
        <h4 className="text-center font-display text-l font-bold xs:text-xl sm:text-2xl md:text-3xl mb-10">
          2024
        </h4>
      </header>

      <div className="sm:flex flex-col items-center gap-10">
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
    </section>
  );
};

export default Testimonials;
