import { useState } from "react";

import router from "next/router";
import { TFunction, useTranslation } from "next-i18next";

import { Role } from "@prisma/client";
import useRole from "~/hooks/use-role";

import { trpc } from "~/lib/trpc";

import type { ContactInfo } from "./common";
import ContactInfoEditForm from "./edit-form";
import ContactInfoDisplay from "./display";

type ContactInfoSectionProps = {
  t: TFunction;
  initialData?: ContactInfo;
};

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  t,
  initialData,
}) => {
  const { t: commonT } = useTranslation("common");

  const role = useRole();
  const [showEditForm, setShowEditForm] = useState(false);

  const query = trpc.common.profileRead.useQuery(undefined, {
    initialData,
    staleTime: 200,
  });

  if (query.isLoading) {
    return <p>{commonT("loading")}</p>;
  }

  if (!query.data) {
    return <p>{commonT("errors.loadingError")}</p>;
  }

  const contactInfo: ContactInfo = query.data;

  return (
    <section>
      <h2 className="font-display text-xl font-semibold">
        {t("contactInfoSectionTitle")}
      </h2>
      {showEditForm ? (
        <ContactInfoEditForm
          t={t}
          contactInfo={contactInfo}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => setShowEditForm(false)}
        />
      ) : (
        <>
          <ContactInfoDisplay t={t} contactInfo={contactInfo} />
          {role === Role.PARTICIPANT && (
            <div className="my-3">
              <button
                onClick={() => setShowEditForm(true)}
                className="rounded-md bg-blue-700 px-3 py-2 text-center text-white hover:bg-blue-800 active:bg-blue-900"
              >
                {t("editProfile")}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ContactInfoSection;
