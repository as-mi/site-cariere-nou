import { useId, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Link from "next/link";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faListCheck } from "@fortawesome/free-solid-svg-icons";

import { Role } from "@prisma/client";
import useRole from "~/hooks/use-role";

import { getLoginPageUrl } from "~/lib/urls";
import { trpc } from "~/lib/trpc";

type TechnicalTestMessageProps = {
  technicalTestId: number;
  mandatory: boolean;
  onSkip: () => void;
  onCancel: () => void;
};

const TechnicalTestMessage: React.FC<TechnicalTestMessageProps> = ({
  technicalTestId,
  mandatory,
  onSkip,
  onCancel,
}) => (
  <>
    <p>
      {mandatory
        ? "Pentru a putea aplica pe acest post, va trebui să răspunzi mai întâi la întrebările din testul tehnic asociat."
        : "Înainte de a aplica pe acest post, este recomandat să completezi testul tehnic asociat."}
    </p>
    <div className="mt-3 space-x-3">
      <Link
        href={`/technical-tests/${technicalTestId}`}
        className="inline-block rounded-md bg-green-700 px-3 py-2 text-white hover:bg-green-800 active:bg-green-900"
      >
        Deschide testul tehnic
      </Link>
      {!mandatory && (
        <button
          type="button"
          onClick={onSkip}
          className="rounded-md bg-yellow-300 px-3 py-2 hover:bg-yellow-200"
        >
          Sari peste
        </button>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md bg-zinc-200 px-3 py-2 hover:bg-zinc-100"
      >
        Anulează
      </button>
    </div>
  </>
);

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

const ApplicationSuccessMessage: React.FC = () => (
  <div>
    <span className="font-semibold text-green-700">Felicitări!</span> Ai aplicat
    cu succes pe această poziție.
  </div>
);

export type Position = {
  id: number;
  title: string;
  category: string;
  requiredSkills: string;
  workSchedule: string;
  workModel: string;
  duration: string;
  descriptionHtml: string;
  alreadyAppliedTo: boolean;
  technicalTestId: number | null;
  technicalTestCompleted: boolean | null;
  technicalTestIsMandatory: boolean;
};

type PositionCardProps = {
  position: Position;
  enableApplicationForm: boolean;
  returnUrl: string;
  initiallyShowApplicationForm?: boolean;
};

const PositionCard: React.FC<PositionCardProps> = ({
  position,
  enableApplicationForm,
  returnUrl,
  initiallyShowApplicationForm,
}) => {
  const router = useRouter();
  const role = useRole();

  const [showApplicationForm, setShowApplicationForm] = useState(
    initiallyShowApplicationForm
  );
  const [showApplicationSuccessMessage, setShowApplicationSuccessMessage] =
    useState(false);
  const [technicalTestSkipped, setTechnicalTestSkipped] = useState(false);

  const showTechnicalTestMessage =
    !!position.technicalTestId &&
    !technicalTestSkipped &&
    !position.technicalTestCompleted;

  const withdrawApplicationMutation =
    trpc.participant.withdrawFromPosition.useMutation({
      onSuccess: () => {
        // TODO: refactor to avoid the need to reload the page
        router.push(router.asPath);
      },
    });

  const withdrawApplication = () => {
    if (confirm("Ești sigur că nu mai vrei să aplici pe acest post?")) {
      withdrawApplicationMutation.mutate({
        positionId: position.id,
      });
    }
  };

  return (
    <div className="w-full max-w-xl rounded-md bg-white p-3 text-black">
      <h3 className="mb-1 font-display text-xl font-bold">{position.title}</h3>
      {position.descriptionHtml ? (
        <div
          className="prose my-1 mx-auto max-w-prose"
          dangerouslySetInnerHTML={{
            __html: position.descriptionHtml,
          }}
        />
      ) : (
        <div className="italic text-zinc-500">
          Nu a fost setată o descriere pentru această poziție.
        </div>
      )}
      {role === undefined && enableApplicationForm && (
        <p className="mt-3">
          <Link
            href={getLoginPageUrl(false, returnUrl)}
            className="text-green-700 hover:text-green-600 active:text-green-500"
          >
            Intră în cont
          </Link>{" "}
          pentru a putea aplica pe această poziție.
        </p>
      )}
      {role === Role.PARTICIPANT &&
        (enableApplicationForm ? (
          <div className="mt-3">
            {position.alreadyAppliedTo ? (
              <>
                <p>Ai aplicat deja pentru această poziție.</p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={withdrawApplication}
                    className="rounded-lg bg-red-500 px-2 py-1 text-white hover:bg-red-600 active:bg-red-700"
                  >
                    Retrage aplicația
                  </button>
                </div>
              </>
            ) : showApplicationSuccessMessage ? (
              <ApplicationSuccessMessage />
            ) : showApplicationForm ? (
              showTechnicalTestMessage ? (
                <TechnicalTestMessage
                  technicalTestId={position.technicalTestId!}
                  mandatory={position.technicalTestIsMandatory}
                  onSkip={() => setTechnicalTestSkipped(true)}
                  onCancel={() => setShowApplicationForm(false)}
                />
              ) : (
                <ApplicationForm
                  onCancel={() => {
                    setShowApplicationForm(false);
                    setTechnicalTestSkipped(false);
                  }}
                  onSuccess={() => {
                    setShowApplicationForm(false);
                    setShowApplicationSuccessMessage(true);
                  }}
                  positionId={position.id}
                />
              )
            ) : (
              <button
                onClick={() => setShowApplicationForm(true)}
                className="rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-400 active:bg-blue-300"
              >
                Aplică acum
              </button>
            )}
          </div>
        ) : (
          <p className="mt-3">
            Aplicările pe posturi sunt momentan dezactivate.
          </p>
        ))}
      {role === Role.ADMIN && (
        <div className="mt-4 flex flex-row flex-wrap items-center justify-center gap-2">
          <Link
            href={`/admin/positions/${position.id}/edit`}
            className="inline-block rounded-md bg-blue-700 px-3 py-2 text-white hover:bg-blue-800 active:bg-blue-900"
          >
            <FontAwesomeIcon
              icon={faEdit}
              className="mr-2 inline-block h-3 w-3"
            />
            Editează postul
          </Link>
          {position.technicalTestId && (
            <Link
              href={`/technical-tests/${position.technicalTestId}`}
              className="inline-block rounded-md bg-blue-700 px-3 py-2 text-white hover:bg-blue-800 active:bg-blue-900"
            >
              <FontAwesomeIcon
                icon={faListCheck}
                className="mr-2 inline-block h-4 w-4"
              />
              Previzualizează testul tehnic
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

PositionCard.defaultProps = {
  initiallyShowApplicationForm: false,
};

export default PositionCard;
