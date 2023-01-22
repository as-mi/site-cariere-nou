import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from "next-i18next";

import { Open_Sans, Jost } from "@next/font/google";

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-open-sans",
});

const jost = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jost",
});

const App: React.FC<AppProps> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={`${openSans.variable} ${jost.variable} font-body`}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default appWithTranslation(App);
