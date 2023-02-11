import classNames from "classnames";

import { TFunction } from "next-i18next";

import { Role } from "@prisma/client";

import useRole from "~/hooks/use-role";

import { ContactInfo } from "./common";

type ContactInfoDisplayProps = {
  t: TFunction;
  contactInfo: ContactInfo;
};

const ContactInfoDisplay: React.FC<ContactInfoDisplayProps> = ({
  t,
  contactInfo,
}) => {
  const role = useRole();

  const phoneNumberMissing = contactInfo.phoneNumber === "";

  return (
    <>
      <div className="py-2">
        <span className="font-semibold">{t("fields.name")}:</span>
        <span className="ml-2">{contactInfo.name}</span>
      </div>
      {role === Role.PARTICIPANT && (
        <div className="py-2">
          <span className="font-semibold">{t("fields.phoneNumber")}:</span>{" "}
          <span
            className={classNames("ml-2", {
              "text-gray-700": phoneNumberMissing,
              italic: phoneNumberMissing,
            })}
          >
            {phoneNumberMissing
              ? "nu a fost setat încă"
              : contactInfo.phoneNumber}
          </span>
        </div>
      )}
      {process.env.NODE_ENV === "development" && role && (
        <div className="py-2">
          <span className="font-semibold">{t("fields.role")}:</span>{" "}
          {role.toLowerCase()}
        </div>
      )}
    </>
  );
};

export default ContactInfoDisplay;
