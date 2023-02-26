import { useId } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Link from "next/link";

import { trpc } from "~/lib/trpc";

type ApplicationFormFieldValues = {
  resumeId: string;
};

type ApplicationFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
  positionId: number;
};

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  onCancel,
  onSuccess,
  positionId,
}) => {
  const mutation = trpc.participant.applyToPosition.useMutation({
    onSuccess,
  });

  const { handleSubmit, watch, register } =
    useForm<ApplicationFormFieldValues>();

  const onSubmit: SubmitHandler<ApplicationFormFieldValues> = (data) => {
    const resumeId = parseInt(data.resumeId);

    mutation.mutate({
      positionId,
      resumeId,
    });
  };

  const watchResumeId = watch("resumeId");

  const id = useId();

  const resumes = trpc.participant.resumeGetAll.useQuery();

  if (resumes.error) {
    return <p>Eroare la încărcarea listei de CV-uri</p>;
  }

  if (!resumes.data) {
    return <p>Se încarcă...</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="font-semibold">Selectează CV-ul cu care vrei să aplici:</p>
      {resumes.data.length > 0 ? (
        <div className="flex flex-wrap">
          {resumes.data.map((resume) => {
            const selected = watchResumeId === resume.id.toString();
            const inputId = `applicationForm-${id}-resume-${resume.id}`;

            return (
              <div key={resume.id} className="flex-1 basis-40">
                <input
                  id={inputId}
                  type="radio"
                  value={resume.id}
                  {...register("resumeId")}
                  className="hidden"
                />
                <label
                  htmlFor={inputId}
                  className={`block cursor-pointer py-6 px-4 ${
                    selected ? "bg-blue-400" : ""
                  } hover:bg-blue-300`}
                >
                  CV cu ID-ul {resume.id}: &quot;{resume.fileName}&quot;
                </label>
              </div>
            );
          })}
        </div>
      ) : (
        <p>Nu ți-ai încărcat încă niciun CV.</p>
      )}

      <p className="my-3">
        Îți poți gestiona CV-urile de pe{" "}
        <Link
          href="/profile"
          className="font-semibold text-green-700 hover:text-green-600 active:text-green-500"
        >
          pagina de profil
        </Link>
        .
      </p>

      <div className="mt-5 space-x-3">
        <button
          type="submit"
          disabled={!watchResumeId}
          className="rounded-md bg-blue-500 px-3 py-2 text-center text-white hover:bg-blue-400 disabled:bg-blue-300"
        >
          Aplică
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-zinc-200 px-3 py-2 hover:bg-zinc-100"
        >
          Anulează
        </button>
      </div>

      {mutation.error && (
        <div className="mt-3 text-red-700">{mutation.error.message}</div>
      )}
    </form>
  );
};

export default ApplicationForm;
