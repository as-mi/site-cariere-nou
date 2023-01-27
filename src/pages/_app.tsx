import type { ReactElement, ReactNode } from "react";

import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from "next-i18next";

import { Open_Sans, Jost } from "@next/font/google";

import "../styles/globals.css";

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-open-sans",
});

const jost = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jost",
});

/**
 * Type for React components with a custom `Layout` property.
 *
 * Based on https://nextjs.org/docs/basic-features/layouts#with-typescript
 */
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App: React.FC<AppPropsWithLayout> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  const pageElement = <Component {...pageProps} />;

  return (
    <SessionProvider session={session}>
      <div className={`${openSans.variable} ${jost.variable} font-body`}>
        {getLayout(pageElement)}
      </div>
    </SessionProvider>
  );
};

export default appWithTranslation(App);
