import { useTranslation } from "next-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation("home");
  return (
    <footer className="bg-black py-5 text-sm text-white">
      <p className="mb-2 text-center">
        © 2023 <b>Asociația Studenților la Matematică și Informatică</b>.{" "}
        {t("footer.allRightsReserved")}
      </p>
      <p className="text-center">{t("footer.madeWithLove")}</p>
    </footer>
  );
};

export default Footer;
