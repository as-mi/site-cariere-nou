import "../styles/globals.css";

import "bootstrap/dist/css/bootstrap.min.css";
import Script from "next/script";
import type { AppProps } from "next/app";
import { config } from "@fortawesome/fontawesome-svg-core";


import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;

// import "../public/assets/vendor/aos/aos.css";
import "../public/assets/vendor/bootstrap/css/bootstrap.min.css";
import "../public/assets/vendor/bootstrap-icons/bootstrap-icons.css";
import "../public/assets/vendor/boxicons/css/boxicons.min.css";
import "../public/assets/vendor/glightbox/css/glightbox.min.css";
import "../public/assets/vendor/remixicon/remixicon.css";
import "../public/assets/vendor/swiper/swiper-bundle.min.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script src="/assets/js/main.js" />
      <Script src="/assets/vendor/aos/aos.js" strategy="beforeInteractive" />
      <Script
        src="/assets/vendor/bootstrap/js/bootstrap.bundle.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/assets/vendor/glightbox/js/glightbox.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/assets/vendor/isotope-layout/isotope.pkgd.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/assets/vendor/swiper/swiper-bundle.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/assets/vendor/waypoints/noframework.waypoints.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/assets/vendor/php-email-form/validate.js"
        strategy="beforeInteractive"
      />
      <link
        href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Jost:300,300i,400,400i,500,500i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i"
        rel="stylesheet"
      />

      <link href="/assets/css/style.css" rel="stylesheet" />
      <Component {...pageProps} />
    </>
  );
}
