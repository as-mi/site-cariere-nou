import i18n from "i18next";
import { I18nextProvider } from "react-i18next";

import roCommon from "../public/locales/ro/common.json";
import roEmails from "../public/locales/ro/emails.json";

import enCommon from "../public/locales/en/common.json";
import enEmails from "../public/locales/en/emails.json";

import { renderToStaticMarkup } from "react-dom/server";

import { convert } from "html-to-text";

export type Language = "ro" | "en";

export const initI18n = async (language: Language): Promise<typeof i18n> => {
  let resources;
  switch (language) {
    case "ro":
      resources = {
        ro: {
          common: roCommon,
          emails: roEmails,
        },
      };
      break;
    case "en":
      resources = {
        en: {
          common: enCommon,
          emails: enEmails,
        },
      };
    default:
      throw new Error("Unsupported language");
  }

  await i18n.init({
    ns: ["common", "emails"],
    resources,
    lng: language,
    fallbackLng: "ro",
  });

  return i18n;
};

export const renderEmail = async <TProps,>(
  EmailComponent: React.FC<TProps>,
  props: TProps & JSX.IntrinsicAttributes,
  i18nObject: typeof i18n
): Promise<JSX.Element> => {
  return (
    <I18nextProvider i18n={i18nObject}>
      <EmailComponent {...props} />
    </I18nextProvider>
  );
};

export const renderEmailToHtml = async <TProps,>(
  emailComponent: React.FC<TProps>,
  props: TProps & JSX.IntrinsicAttributes,
  i18nObject: typeof i18n
): Promise<string> => {
  const node = await renderEmail(emailComponent, props, i18nObject);

  return renderToStaticMarkup(node);
};

export const convertHtmlToText = (renderedEmail: string): string => {
  return convert(renderedEmail, {
    selectors: [{ selector: "a", options: { hideLinkHrefIfSameAsText: true } }],
  });
};
