import { useTranslation } from "next-i18next";

const ApplicationsClosedNotice: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="sticky top-0 z-30 flex flex-row items-center justify-center bg-amber-300 py-2 px-4">
      <span className="mr-4 hidden h-5 w-5 sm:inline-block" />
      <div>
        <span className="mr-1 font-semibold">
          {t("applicationsClosedNotice.projectIsOver")}
        </span>
        <span>{t("applicationsClosedNotice.disclaimer")}</span>
      </div>
    </div>
  );
};

export default ApplicationsClosedNotice;
