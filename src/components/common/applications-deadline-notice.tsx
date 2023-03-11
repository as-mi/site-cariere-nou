import { useCallback, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Applications deadline is 15.03.2023, at 23:59:59
// (note that month is 0-indexed in JavaScript)
const APPLICATIONS_DEADLINE = new Date(2023, 2, 15, 23, 59, 59);

/**
 * Local storage key used to retain whether
 * the notice about the applications deadline has already been dismissed.
 */
const NOTICE_DISMISSED_STORAGE_KEY = "applications-deadline-notice-dismissed";

const ApplicationsDeadlineNotice: React.FC = () => {
  const { t } = useTranslation("common");

  const [dismissed, setDismissed] = useState<string | null>("true");

  useEffect(() => {
    setDismissed(localStorage.getItem(NOTICE_DISMISSED_STORAGE_KEY));
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(NOTICE_DISMISSED_STORAGE_KEY, "true");
    setDismissed("true");
  }, []);

  if (typeof window === "undefined") {
    return null;
  }

  if (dismissed) {
    return null;
  }

  const now = new Date();
  if (now > APPLICATIONS_DEADLINE) {
    return null;
  }

  return (
    <div className="sticky top-0 z-30 flex flex-row items-center justify-center bg-amber-300 py-2 px-4">
      <span className="mr-4 hidden h-5 w-5 sm:inline-block" />
      <div>
        <span className="mr-1 font-semibold">
          {t("applicationsDeadlineNotice.hurryUp")}
        </span>
        <span>
          {t("applicationsDeadlineNotice.canApplyUntil")}{" "}
          <span
            title={APPLICATIONS_DEADLINE.toLocaleDateString("ro", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            className="font-semibold"
          >
            {APPLICATIONS_DEADLINE.toLocaleDateString("ro", {
              day: "numeric",
              month: "long",
            })}
          </span>
          .
        </span>
      </div>
      <button
        type="button"
        title={t("applicationsDeadlineNotice.dismiss")!}
        onClick={dismiss}
        className="ml-4 text-black hover:text-zinc-800 active:text-zinc-700"
      >
        <FontAwesomeIcon icon={faClose} className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ApplicationsDeadlineNotice;
