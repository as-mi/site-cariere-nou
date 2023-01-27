import { useTranslation } from "react-i18next";

type EmailProps = {
  name: string;
  resetPasswordUrl: string;
};

const Email: React.FC<EmailProps> = ({ name, resetPasswordUrl }) => {
  const { t, i18n } = useTranslation("emails");

  return (
    <html lang={i18n.language}>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />

        <title>{t("resetPassword.subject")}</title>
      </head>
      <body>
        <main>
          <p>{t("common.hello", { name })}</p>
          <p>{t("resetPassword.instructions")}</p>
          <p>
            <a href={resetPasswordUrl} target="_blank" rel="noreferrer">
              {resetPasswordUrl}
            </a>
          </p>
          <p>
            {t("common.goodLuck")} <br />
            {t("common.teamCariere")}
          </p>
        </main>
      </body>
    </html>
  );
};

export default Email;
