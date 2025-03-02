import { useCallback } from "react";

import { useTranslation } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import Flag from "react-world-flags";
import { faWindows } from "@fortawesome/free-brands-svg-icons";

const Translate: React.FC = () => {
  const { t } = useTranslation("common");

  const handleClick = useCallback(() => {
    var remaining = window.location.href.replace(
      `${window.location.origin}`,
      "",
    );
    if (remaining != null) {
      remaining = remaining.replace(`${t("translate.current")}`, "");
    }
    window.location.href = `${window.location.origin}/${t(
      "translate.behavior",
    )}/${remaining}`;
  }, []);

  return (
    <button
      onClick={handleClick}
      style={{ bottom: "-0.25rem" }}
      className="fixed left-4 rounded-t-xl drop-shadow-md bg-white text-white p-2 pb-2 z-30 hover:translate-y-[-5px] transition-transform duration-200"
    >
      <span title={t("translate.placeholder") || undefined}>
        <Flag code={t("translate.flag")} className="w-6 h-6" />
      </span>
    </button>
  );
};

export default Translate;
