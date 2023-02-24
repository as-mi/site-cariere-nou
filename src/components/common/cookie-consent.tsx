import { useCallback, useEffect, useState } from "react";

import Cookies from "js-cookie";

import Link from "next/link";

import { useTranslation } from "next-i18next";

const CONSENT_COOKIE_KEY = "cookie_consent";
const CONSENT_COOKIE_EXPIRE_TIME = 365;

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();

  const [cookieConsentGiven, setCookieConsentGiven] = useState(true);

  useEffect(() => {
    const cookieConsent = Cookies.get(CONSENT_COOKIE_KEY) === "true";
    setCookieConsentGiven(cookieConsent);
  }, []);

  const handleClick = useCallback(() => {
    Cookies.set(CONSENT_COOKIE_KEY, "true", {
      expires: CONSENT_COOKIE_EXPIRE_TIME,
    });
    setCookieConsentGiven(true);
  }, []);

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
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
