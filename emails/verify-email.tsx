import { useTranslation } from "react-i18next";

type EmailProps = {
  name: string;
  verifyUrl: string;
};

const Email: React.FC<EmailProps> = ({ name, verifyUrl }) => {
  const { t, i18n } = useTranslation("emails", { keyPrefix: "verifyEmail" });

  return (
    <html lang={i18n.language}>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />

        <title>{t("subject")}</title>
      </head>
      <body>
        <main>
          <p>{t("hello", { name })}</p>
          <p>{t("thanksForCreatingAccount")}</p>
          <p>
            <a href={verifyUrl} target="_blank" rel="noreferrer">
              {verifyUrl}
            </a>
          </p>
          <p>{t("doNothingIfUnsolicited")}</p>
          <p>
            {t("goodLuck")} <br />
            {t("teamCariere")}
          </p>
        </main>
      </body>
    </html>
  );
};

export default Email;
