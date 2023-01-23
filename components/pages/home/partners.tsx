import { TFunction } from "next-i18next";

type PartnersSectionProps = {
  t: TFunction;
};

const PartnersSection: React.FC<PartnersSectionProps> = ({ t }) => (
  <section id="partners" className="bg-black px-3 py-16 text-white">
    <header className="mb-10">
      <h2 className="text-center font-display text-3xl font-bold uppercase">
        {t("partnersSection.title")}
      </h2>
    </header>
    <p className="mx-auto max-w-xs text-xl sm:max-w-prose sm:py-10">
      {t("partnersSection.comingSoon")}
    </p>
  </section>
);

export default PartnersSection;
