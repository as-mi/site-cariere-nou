import { useState } from "react";

import { I18n, TFunction, useTranslation } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

import { trpc } from "~/lib/trpc";

import { Resume } from "./common";
import ResumeUploadForm from "./upload-form";
import ResumesDisplay from "./display";

type ResumesSectionProps = {
  t: TFunction;
  i18n: I18n;
  initialData?: Resume[];
};

const ResumesSection: React.FC<ResumesSectionProps> = ({
  t,
  i18n,
  initialData,
}) => {
  const { t: commonT } = useTranslation("common");

  const [showResumeUploadForm, setShowResumeUploadForm] = useState(false);

  const query = trpc.participant.resumeGetAll.useQuery(undefined, {
    initialData,
    staleTime: 500,
  });

  if (query.isLoading) {
    return <p>{commonT("loading")}</p>;
  }

  if (!query.data) {
    return <p>{commonT("errors.loadingError")}</p>;
  }

  const resumesCount = query.data.length;
  const canUploadResume = resumesCount < 5;

  return (
    <section className="mt-5">
      <h2 className="font-display text-xl font-semibold">
        {t("resumesSectionTitle")}
      </h2>
      <div className="my-3">
        {showResumeUploadForm ? (
          <ResumeUploadForm
            t={t}
            i18n={i18n}
            onCancel={() => setShowResumeUploadForm(false)}
            onSuccess={() => setShowResumeUploadForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowResumeUploadForm(true)}
            disabled={!canUploadResume}
            className="inline-flex flex-row items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400"
          >
            <FontAwesomeIcon icon={faUpload} className="mr-2 h-4 w-4" />
            {t("uploadResume")}
          </button>
        )}
      </div>
      <ResumesDisplay t={t} initialData={initialData} />
    </section>
  );
};

export default ResumesSection;
