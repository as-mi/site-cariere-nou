import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { I18n, TFunction, useTranslation } from "next-i18next";

import { trpc } from "~/lib/trpc";

type ResumeUploadFormProps = {
  t: TFunction;
  i18n: I18n;
  onCancel: () => void;
  onSuccess: () => void;
};

type ResumeUploadFormFieldValues = {
  file: FileList;
};

const ResumeUploadForm: React.FC<ResumeUploadFormProps> = ({
  t,
  i18n,
  onCancel,
  onSuccess,
}) => {
  const { t: commonT, i18n: commonI18n } = useTranslation("common");

  const queryClient = useQueryClient();

  const [isUploading, setIsUploading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");

  const { handleSubmit, register, watch } =
    useForm<ResumeUploadFormFieldValues>();

  const watchFile = watch("file");

  const numberOfFilesSelected = watchFile?.length ?? 0;
  const submitDisabled = numberOfFilesSelected === 0 || isUploading;

  const onSubmit: SubmitHandler<ResumeUploadFormFieldValues> = async (data) => {
    setIsUploading(true);
    setFileUploadError("");

    const formData = new FormData();
    formData.append("file", data.file[0]);

    let response;
    try {
      const options = {
        method: "POST",
        body: formData,
      };
      response = await fetch("/api/resumes/upload", options);
    } catch (e) {
      setIsUploading(false);
      setFileUploadError(commonT("errors.networkError")!);
      return;
    }

    if (!response.ok) {
      setIsUploading(false);

      if (
        response.status === 413 ||
        (response.status === 500 &&
          (await response.text()) === "File too large")
      ) {
        setFileUploadError(t("resumeUploadForm.errors.file-too-big")!);
        return;
      }

      let errorInfo;
      try {
        errorInfo = await response.json();
      } catch {
        setFileUploadError(
          commonT("errors.errorCode", { code: response.status })!
        );
        return;
      }

      const error = errorInfo.error;

      const profileErrorMessageKey = `profile:resumeUploadForm.errors.${error}`;
      if (i18n.exists(profileErrorMessageKey)) {
        setFileUploadError(t(profileErrorMessageKey)!);
        return;
      }

      const commonErrorMessageKey = `common:errors.${error}`;
      if (commonI18n.exists(commonErrorMessageKey)) {
        setFileUploadError(commonT(commonErrorMessageKey)!);
        return;
      }

      setFileUploadError(
        commonT("errors.errorCode", { code: response.status })!
      );
      return;
    }

    // Invalidate the resume list cached locally on the client
    const queryKey = getQueryKey(
      trpc.participant.resumeGetAll,
      undefined,
      "query"
    );
    queryClient.invalidateQueries(queryKey);

    console.log("success");

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="file" className="mb-1 block font-semibold">
          {t("resumeUploadForm.file")}:
        </label>
        <input
          id="file"
          type="file"
          accept="application/pdf"
          aria-describedby="fileUploadHints"
          {...register("file", { required: true })}
          className="my-2 max-w-full"
        />
        <p id="fileUploadHints" className="text-sm italic text-gray-500">
          {t("resumeUploadForm.hints.fileMustBeInFormat")}{" "}
          <span className="whitespace-nowrap">
            {t("resumeUploadForm.hints.pdfFormat")}
          </span>{" "}
          {t("resumeUploadForm.hints.and")}{" "}
          {t("resumeUploadForm.hints.fileMustHaveMaximumSize")}{" "}
          <span className="whitespace-nowrap">2 MiB</span>
        </p>
      </div>
      <div className="my-3 space-x-3">
        <button
          type="submit"
          disabled={submitDisabled}
          className="rounded-md bg-blue-700 px-3 py-2 text-center text-white hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-300"
        >
          {t("resumeUploadForm.submit")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-zinc-700 px-3 py-2 text-center text-white hover:bg-zinc-800 active:bg-zinc-900"
        >
          {t("resumeUploadForm.cancel")}
        </button>
      </div>
      {fileUploadError && (
        <div className="text-red-600">
          {t("resumeUploadForm.errorOccurred")}: {fileUploadError}
        </div>
      )}
    </form>
  );
};

export default ResumeUploadForm;
