import { TFunction, useTranslation } from "next-i18next";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { trpc } from "~/lib/trpc";

import { Resume } from "./common";

type ResumesDisplayProps = {
  t: TFunction;
  initialData?: Resume[];
};

const ResumesDisplay: React.FC<ResumesDisplayProps> = ({ t, initialData }) => {
  const { t: commonT } = useTranslation("common");

  const queryClient = useQueryClient();

  const query = trpc.participant.resumeGetAll.useQuery(undefined, {
    initialData,
    staleTime: 200,
  });

  const deleteResumeMutation = trpc.participant.resumeDelete.useMutation({
    onSuccess: (_, variables) => {
      const queryKey = getQueryKey(
        trpc.participant.resumeGetAll,
        undefined,
        "query"
      );

      console.log(initialData);
      if (initialData) {
        // Update the list of resumes
        const resumes = initialData.filter(
          (resume) => resume.id !== variables.id
        );
        queryClient.setQueryData(queryKey, resumes);
      } else {
        // Invalidate the resume list and re-fetch them
        queryClient.invalidateQueries(queryKey);
      }
    },
  });

  const deleteResume = (resumeId: number) => {
    if (confirm("Ești sigur că vrei să ștergi acest CV?")) {
      deleteResumeMutation.mutate({ id: resumeId });
    }
  };

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
    <>
      <ul className="space-y-1">
        {resumes.map((resume, index) => (
          <li key={resume.id} className="flex flex-row flex-wrap border p-3">
            <span className="mr-3">
              {t("resumesDisplay.resumeTitle", { resumeIndex: index + 1 })}:
            </span>
            <span>
              &quot;
              {resume.fileName}
              &quot;
            </span>
            <span className="ml-auto">
              <button
                type="button"
                title="Șterge acest CV"
                onClick={() => deleteResume(resume.id)}
              >
                <FontAwesomeIcon
                  icon={faTrash}
                  className="h-4 w-4 text-red-600 hover:text-red-700 active:text-red-800"
                />
              </button>
            </span>
          </li>
        ))}
      </ul>
      <p className="py-2 text-end">
        Ai încărcat {resumes.length} din maxim 5 CV-uri.
      </p>
    </>
  );
};

export default ResumesDisplay;
