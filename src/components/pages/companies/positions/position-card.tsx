import { useEffect, useRef, useState } from "react";

import classNames from "classnames";

import Link from "next/link";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faListCheck } from "@fortawesome/free-solid-svg-icons";

import { Role } from "@prisma/client";
import useRole from "~/hooks/use-role";

import { getLoginPageUrl } from "~/lib/urls";
import { trpc } from "~/lib/trpc";

import ApplicationForm from "./application-form";
import ApplicationSuccessMessage from "./application-success-message";
import PositionDescription from "./position-description";
import TechnicalTestMessage from "./technical-test-message";

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

  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

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

  useEffect(() => {
    if (expanded) {
      const cardElement = ref.current;
      if (!cardElement) {
        return;
      }

      const rect = cardElement.getBoundingClientRect();
      const width = rect.right - rect.left;

      window.scrollTo({
        top: window.scrollY + rect.top - 150,
        left: window.scrollX + rect.left - width / 2,
        behavior: "smooth",
      });
    }
  }, [expanded]);

  return (
    <div ref={ref} className={classNames({ "w-full": expanded })}>
      <div className={"mx-auto max-w-lg rounded-md bg-white p-3 text-black"}>
        <h3 className="mb-1 font-display text-xl font-bold xs:mb-4">
          {position.title}
        </h3>
        {position.descriptionHtml ? (
          <PositionDescription
            descriptionHtml={position.descriptionHtml}
            onExpand={setExpanded}
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
    </div>
  );
};

PositionCard.defaultProps = {
  initiallyShowApplicationForm: false,
};

export default PositionCard;
