import { useCallback } from "react";

import { TFunction, useTranslation } from "next-i18next";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { trpc } from "~/lib/trpc";

import { Resume } from "./common";
import ResumeCard from "./card";

type ResumesDisplayProps = {
  t: TFunction;
  initialData?: Resume[];
  replaceResumeId?: number;
  onReplaceResume: (resumeId: number) => void;
};

const ResumesDisplay: React.FC<ResumesDisplayProps> = ({
  t,
  initialData,
  replaceResumeId,
  onReplaceResume,
}) => {
  const { t: commonT } = useTranslation("common");

  const query = trpc.participant.resumeGetAll.useQuery(undefined, {
    initialData,
    staleTime: 200,
  });

  const queryClient = useQueryClient();

  const deleteResumeMutation = trpc.participant.resumeDelete.useMutation({
    onSuccess: (_, variables) => {
      const queryKey = getQueryKey(
        trpc.participant.resumeGetAll,
        undefined,
        "query"
      );

      const queryData = queryClient.getQueryData<typeof query.data>(queryKey);
      if (queryData) {
        // Update the list of resumes
        const resumes = queryData.filter(
          (resume) => resume.id !== variables.id
        );
        queryClient.setQueryData(queryKey, resumes);
      } else {
        // Invalidate the resume list and re-fetch them
        queryClient.invalidateQueries(queryKey);
      }
    },
  });

  const deleteResume = useCallback(
    (resumeId: number) => {
      if (confirm("Ești sigur că vrei să ștergi acest CV?")) {
        deleteResumeMutation.mutate({ id: resumeId });
      }
    },
    [deleteResumeMutation]
  );

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
          <li key={resume.id}>
            <ResumeCard
              t={t}
              index={index}
              resume={resume}
              replacing={replaceResumeId === resume.id}
              onReplace={() => onReplaceResume(resume.id)}
              onDelete={() => deleteResume(resume.id)}
            />
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
