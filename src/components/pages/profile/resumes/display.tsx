import { TFunction, useTranslation } from "next-i18next";

import { trpc } from "~/lib/trpc";

import { Resume } from "./common";

type ResumesDisplayProps = {
  t: TFunction;
  initialData?: Resume[];
};

const ResumesDisplay: React.FC<ResumesDisplayProps> = ({ t, initialData }) => {
  const { t: commonT } = useTranslation("common");

  const query = trpc.participant.resumeGetAll.useQuery(undefined, {
    initialData,
    staleTime: 200,
  });

  if (query.isLoading) {
    return <p>{commonT("loading")}</p>;
  }

  if (!query.data) {
    return <p>{commonT("errors.loadingError")}</p>;
  }

  const resumes: Resume[] = query.data;

  if (resumes.length === 0) {
    return <p>{t("resumesDisplay.noResumeFound")}</p>;
  }

  return (
    <ul className="space-y-1">
      {resumes.map((resume, index) => (
        <li key={resume.id} className="border p-3">
          {t("resumesDisplay.resumeTitle", { resumeIndex: index + 1 })}:
          &nbsp;&nbsp; &quot;
          {resume.fileName}
          &quot;
        </li>
      ))}
    </ul>
  );
};

export default ResumesDisplay;
