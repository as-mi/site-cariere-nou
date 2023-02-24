import { useCallback, useEffect, useState } from "react";

import Cookies from "js-cookie";

import Link from "next/link";

import { useTranslation } from "next-i18next";

const CONSENT_COOKIE_NAME = "cookies-consent";
const CONSENT_COOKIE_EXPIRE_TIME = 30;

/**
 * Simple cookie consent banner, which allows the user to accept the usage of cookies.
 *
 * Based on https://codersteps.com/articles/how-to-add-cookie-consent-banner-with-next-js-and-tailwind-css
 */
const CookieConsent: React.FC = () => {
  const { t } = useTranslation();

  // We start with this variable implicitly `true`, in order to avoid
  // temporarily displaying the cookie consent form while reading the consent status.
  const [cookieConsentGiven, setCookieConsentGiven] = useState(true);

  useEffect(() => {
    const cookieConsent = Cookies.get(CONSENT_COOKIE_NAME) === "true";

    setCookieConsentGiven(cookieConsent);
  }, []);

  const handleClick = useCallback(() => {
    Cookies.set(CONSENT_COOKIE_NAME, "true", {
      expires: CONSENT_COOKIE_EXPIRE_TIME,
      sameSite: "Strict",
    });

    setCookieConsentGiven(true);
  }, []);

  // If the user already gave us consent to use cookies, don't display the notice anymore
  if (cookieConsentGiven) {
    return null;
  }

  return (
    <div className="fixed bottom-4 z-50 w-full px-4 text-center sm:bottom-6 md:bottom-8">
      <div className="inline-flex flex-row justify-center rounded-lg bg-black p-4 text-sm text-white drop-shadow-lg sm:text-base">
        <p>
          {t("cookieConsent.disclaimer")}{" "}
          <Link
            href="/cookie-policy"
            className="whitespace-nowrap text-green-300 hover:text-green-500"
          >
            {t("cookieConsent.findOutMore")}
          </Link>
          .
        </p>
        <div className="ml-1 flex flex-col justify-center xs:ml-4">
          <button
            onClick={handleClick}
            className="rounded-sm bg-green-800 px-2 py-0.5"
          >
            {t("cookieConsent.ok")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
