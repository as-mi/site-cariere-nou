import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { TFunction } from "next-i18next";

import { trpc } from "~/lib/trpc";

import { Resume } from "./common";

type ResumeUploadFormProps = {
  t: TFunction;
  onCancel: () => void;
  onSuccess: () => void;
};

type ResumeUploadFormFieldValues = {
  file: FileList;
};

const ResumeUploadForm: React.FC<ResumeUploadFormProps> = ({
  t,
  onCancel,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const [fileUploadError, setFileUploadError] = useState("");

  const { handleSubmit, register, watch } =
    useForm<ResumeUploadFormFieldValues>();

  const watchFile = watch("file");

  const onSubmit: SubmitHandler<ResumeUploadFormFieldValues> = async (data) => {
    setFileUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", data.file[0]);

      const options = {
        method: "POST",
        body: formData,
      };
      const response = await fetch("/api/resumes/upload", options);
      if (!response.ok) {
        throw new Error(
          `Failed to upload résumé: status code ${response.status}`
        );
      }
    } catch (e) {
      if (e instanceof Error) {
        setFileUploadError(e.message);
      } else {
        setFileUploadError("Failed to upload logo");
      }
      return;
    }

    // Invalidate the resume list cached locally on the client
    const queryKey = getQueryKey(
      trpc.participant.resumeGetAll,
      undefined,
      "query"
    );
    queryClient.invalidateQueries(queryKey);

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="file" className="mb-1 block font-semibold">
          Fișier:
        </label>
        <input
          id="file"
          type="file"
          accept="application/pdf"
          {...register("file", { required: true })}
        />
      </div>
      <div className="my-3 space-x-3">
        <button
          type="submit"
          disabled={(watchFile?.length ?? 0) === 0}
          className="rounded-md bg-blue-700 px-3 py-2 text-center text-white disabled:bg-blue-300"
        >
          {t("resumeUploadForm.submit")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-zinc-700 px-3 py-2 text-center text-white"
        >
          {t("resumeUploadForm.cancel")}
        </button>
      </div>
      {fileUploadError && <div className="text-red-600">{fileUploadError}</div>}
    </form>
  );
};

export default ResumeUploadForm;
