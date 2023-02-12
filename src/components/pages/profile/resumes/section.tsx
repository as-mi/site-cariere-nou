import { useState } from "react";

import { TFunction } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

import { Resume } from "./common";
import ResumeUploadForm from "./upload-form";
import ResumesDisplay from "./display";

type ResumesSectionProps = {
  t: TFunction;
  initialData?: Resume[];
};

const ResumesSection: React.FC<ResumesSectionProps> = ({ t, initialData }) => {
  const [showResumeUploadForm, setShowResumeUploadForm] = useState(false);

  return (
    <section className="mt-5">
      <h2 className="font-display text-xl font-semibold">
        {t("resumesSectionTitle")}
      </h2>
      <div className="my-3">
        {showResumeUploadForm ? (
          <ResumeUploadForm
            t={t}
            onCancel={() => setShowResumeUploadForm(false)}
            onSuccess={() => setShowResumeUploadForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowResumeUploadForm(true)}
            className="inline-flex flex-row items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 active:bg-blue-800"
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
