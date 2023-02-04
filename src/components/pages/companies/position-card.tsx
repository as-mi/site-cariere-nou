import { useId, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { Role } from "@prisma/client";
import useRole from "~/hooks/use-role";

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

      <div className="mt-3 space-x-3">
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
    </form>
  );
};

const ApplicationSuccessMessage: React.FC = () => (
  <div>
    <span className="font-semibold text-green-700">Felicitări!</span> Ai aplicat
    cu succes pe această poziție.
  </div>
);

export type Position = {
  id: number;
  title: string;
  descriptionHtml: string;
  alreadyAppliedTo: boolean;
};

type PositionCardProps = {
  position: Position;
};

const PositionCard: React.FC<PositionCardProps> = ({ position }) => {
  const role = useRole();

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showApplicationSuccessMessage, setShowApplicationSuccessMessage] =
    useState(false);

  return (
    <div className="rounded-md bg-white p-3 text-black">
      <h3 className="mb-1 font-display text-xl">{position.title}</h3>
      {position.descriptionHtml ? (
        <div
          className="prose mx-auto max-w-prose"
          dangerouslySetInnerHTML={{
            __html: position.descriptionHtml,
          }}
        />
      ) : (
        <div className="italic text-zinc-500">
          Nu a fost setată o descriere pentru această poziție.
        </div>
      )}
      {role === Role.PARTICIPANT && (
        <div className="mt-3">
          {position.alreadyAppliedTo ? (
            <p>Ai aplicat deja pentru această poziție.</p>
          ) : showApplicationSuccessMessage ? (
            <ApplicationSuccessMessage />
          ) : showApplicationForm ? (
            <ApplicationForm
              onCancel={() => setShowApplicationForm(false)}
              onSuccess={() => {
                setShowApplicationForm(false);
                setShowApplicationSuccessMessage(true);
              }}
              positionId={position.id}
            />
          ) : (
            <button
              onClick={() => setShowApplicationForm(true)}
              className="rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-400 active:bg-blue-300"
            >
              Aplică acum
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PositionCard;
