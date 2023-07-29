import i18n from "i18next";
import { I18nextProvider } from "react-i18next";

import { renderToStaticMarkup } from "react-dom/server";
import { convert } from "html-to-text";

import nodemailer from "nodemailer";

import { User } from "@prisma/client";

import roCommon from "~/locales/ro/common.json";
import roEmails from "~/locales/ro/emails.json";

import enCommon from "~/locales/en/common.json";
import enEmails from "~/locales/en/emails.json";

import VerifyEmail from "~/emails/verify-email";

import { getBaseUrl } from "./base-url";

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
  i18nObject: typeof i18n,
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
  i18nObject: typeof i18n,
): Promise<string> => {
  const node = await renderEmail(emailComponent, props, i18nObject);

  return renderToStaticMarkup(node);
};

export const convertHtmlToText = (renderedEmail: string): string => {
  return convert(renderedEmail, {
    selectors: [{ selector: "a", options: { hideLinkHrefIfSameAsText: true } }],
  });
};

declare let global: {
  // Cache the e-mail transporter in a global variable,
  // to reuse it whenever possible.
  transporter: nodemailer.Transporter;
};

const getEmailTransporter = () => {
  if (!global.transporter) {
    const options = process.env.EMAIL_CONNECTION_STRING;
    if (!options) {
      throw new Error(
        "`EMAIL_CONNECTION_STRING` environment variable is not configured",
      );
    }
    global.transporter = nodemailer.createTransport(options);
  }
  return global.transporter;
};

type EmailAddress = string;

type EmailMessage = {
  subject: string;
  text: string;
  html: string;
};

/**
 * Sends an e-mail message using the application's e-mail account.
 *
 * @param to destination address
 * @param subject subject line of the message
 * @param html message in HTML format
 * @param text message in plain text format
 */
const sendEmail = async (
  to: EmailAddress,
  { subject, text, html }: EmailMessage,
) => {
  if (process.env.MAILER_DISABLE_EMAIL_SENDING) {
    console.log(
      "Faking sending an e-mail to '%s' with subject '%s'",
      to,
      subject,
    );
    return;
  }

  const transporter = getEmailTransporter();

  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("`EMAIL_FROM` environment variable is not configured");
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  if (info.accepted.length < 1) {
    throw new Error("Failed to send e-mail message: " + JSON.stringify(info));
  }
};

/**
 * Sends an e-mail address verification message to the indicated user.
 *
 * @param user user for which the e-mail is intended
 * @param language language for the e-mail's contents
 * @param verificationToken verification token to be used in the validation process
 */
export const sendVerificationEmail = async (
  user: Pick<User, "id" | "name" | "email">,
  language: Language,
  verificationToken: string,
) => {
  const { id, name, email } = user;

  console.log("Sending a verification e-mail to `%s`", email);

  const i18n = await initI18n(language);
  const subject = i18n.t("verifyEmail.subject", { ns: "emails" });

  const baseUrl = getBaseUrl();
  const verifyEmailUrl = `${baseUrl}/auth/verify-email?id=${id}&token=${verificationToken}`;

  const props = { name, verifyEmailUrl };
  const html = await renderEmailToHtml(VerifyEmail, props, i18n);
  const text = convertHtmlToText(html);

  await sendEmail(email, { subject, text, html });
};
