import { useTranslation } from "react-i18next";

type EmailProps = {
  name: string;
  verifyEmailUrl: string;
};

const Email: React.FC<EmailProps> = ({ name, verifyEmailUrl }) => {
  const { t, i18n } = useTranslation("emails");

  return (
    <html lang={i18n.language}>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />

        <title>{t("verifyEmail.subject")}</title>
      </head>
      <body>
        <main>
          <p>{t("common.hello", { name })}</p>
          <p>{t("verifyEmail.thanksForCreatingAccount")}</p>
          <p>
            <a href={verifyEmailUrl} target="_blank" rel="noreferrer">
              {verifyEmailUrl}
            </a>
          </p>
          <p>{t("verifyEmail.doNothingIfUnsolicited")}</p>
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
