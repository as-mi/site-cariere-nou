import { renderToStaticMarkup } from "react-dom/server";

import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import { convertHtmlToText, initI18n, renderEmail } from "../lib/emails";
import VerifyEmailAddressEmail from "../emails/verify-email";
import ResetPasswordEmail from "../emails/reset-password";

type EmailsPreviewPageProps = {
  renderedEmail: string;
};

const EmailsPreviewPage: NextPage<EmailsPreviewPageProps> = ({
  renderedEmail,
}) => {
  return (
    <>
      <Head>
        <title>Preview mesaje e-mail</title>
      </Head>
      <main>
        <header>
          <h1 className="text-3xl">E-mail preview</h1>
          <p>
            Această pagină permite previzualizarea mesajelor de e-mail care pot
            fi trimise de către aplicație.
          </p>
          {renderedEmail && (
            <div className="border border-solid border-zinc-500">
              <div dangerouslySetInnerHTML={{ __html: renderedEmail }}></div>
            </div>
          )}
        </header>
      </main>
    </>
  );
};

export default EmailsPreviewPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (process.env.NODE_ENV !== "development") {
    return {
      notFound: true,
    };
  }

  let renderedEmail = null;

  const { query } = context;

  const format = query["format"] ?? "html";

  if (query?.hasOwnProperty("emailSlug")) {
    const emailSlug = query["emailSlug"] as string;

    const i18n = await initI18n("ro");

    let node: JSX.Element;
    try {
      let props;
      switch (emailSlug) {
        case "verify-email":
          props = {
            name: "Nume Prenume",
            verifyEmailUrl:
              "http://localhost:3000/auth/verify-email?id=1&token=1234",
          };
          node = await renderEmail(VerifyEmailAddressEmail, props, i18n);
          break;
        case "reset-password":
          props = {
            name: "Nume Prenume",
            resetPasswordUrl:
              "http://localhost:3000/auth/reset-password?id=1&token=1234",
          };
          node = await renderEmail(ResetPasswordEmail, props, i18n);
          break;
        default:
          throw new Error(`Unknown e-mail: '${emailSlug}'`);
      }
    } catch (e) {
      let errorMessage = "Failed to render e-mail template";

      if (e instanceof Error) {
        errorMessage += `: ${e.message}`;
      }

      node = <p className="font-semibold text-red-600">{errorMessage}</p>;
    }

    renderedEmail = renderToStaticMarkup(node);

    if (format === "text") {
      renderedEmail = convertHtmlToText(renderedEmail);
    }
  }

  return {
    props: {
      renderedEmail,
    },
  };
};
