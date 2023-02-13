import { useTranslation } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const RegistrationSuccessMessage: React.FC = () => {
  const { t } = useTranslation("register");

  return (
    <>
      <h2 className="mt-1 mb-3 font-display text-xl font-bold">
        <FontAwesomeIcon
          icon={faCheck}
          className="mr-3 h-4 w-4 text-green-800"
        />
        {t("registrationSuccess.title")}
      </h2>
      <p className="font-body sm:px-7">
        {t("registrationSuccess.verifyEmailMessage")}
      </p>
    </>
  );
};

export default RegistrationSuccessMessage;
