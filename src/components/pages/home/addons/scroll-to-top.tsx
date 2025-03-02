import { useCallback } from "react";

import { useTranslation } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

const ScrollToTopButton: React.FC = () => {
  const { t } = useTranslation("common");

  const handleClick = useCallback(() => {
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      onClick={handleClick}
      className="bg-user fixed bottom-4 right-4 z-50 rounded-full bg-green-800 p-2 text-white drop-shadow-md transform transition-transform duration-200 hover:scale-110"
    >
      <span title={t("scrollToTop") || undefined}>
        <FontAwesomeIcon icon={faArrowUp} className="h-6 w-6" />
      </span>
    </button>
  );
};

export default ScrollToTopButton;
