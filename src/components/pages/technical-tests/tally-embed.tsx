import React, { useEffect, useState } from "react";
import Script from "next/script";
import { trpc } from "~/lib/trpc";
import { useRouter } from "next/router";
import answers from "~/pages/api/technical-tests/[id]/answers";
import Countdown from "./countdown";

interface SubmissionPayload {
  id: string; // submission ID
  respondentId: string;
  formId: string;
  formName: string;
  createdAt: string; // submission date
  fields: Array<{
    id: string;
    title: string;
    type:
      | "INPUT_TEXT"
      | "INPUT_NUMBER"
      | "INPUT_EMAIL"
      | "INPUT_PHONE_NUMBER"
      | "INPUT_LINK"
      | "INPUT_DATE"
      | "INPUT_TIME"
      | "TEXTAREA"
      | "MULTIPLE_CHOICE"
      | "DROPDOWN"
      | "CHECKBOXES"
      | "LINEAR_SCALE"
      | "FILE_UPLOAD"
      | "HIDDEN_FIELDS"
      | "CALCULATED_FIELDS"
      | "RATING"
      | "MULTI_SELECT"
      | "MATRIX"
      | "RANKING"
      | "SIGNATURE"
      | "PAYMENT";
    answer: { value: any; raw: any };
  }>;
}

type Tally_From_Props = {
  tallyLink: string;
  userId: number;
  technicalTestId: number;
};

type AddTechnicalTestAnswer = {
  userId: number;
  technicalTestId: number;
  answers: string;
  createdAt: string;
};

export default function Tally_From({
  tallyLink,
  userId,
  technicalTestId,
}: Tally_From_Props) {
  const router = useRouter();

  const [time, setTime] = useState(100);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);

  const mutation =
    trpc.technicalTestAnswers.technicalTestAnswers.create.useMutation({
      onSuccess: () => {
        // router.push("/technicalTestAnswers/technicalTestAnswers");
      },
    });

  useEffect(() => {
    const handleSumbitForm = async (e: MessageEvent) => {
      if (e?.data?.includes("Tally.FormSubmitted")) {
        setRunning(false);
        setFinished(true);

        const payload = JSON.parse(e.data).payload as SubmissionPayload;
        const userAnswer: AddTechnicalTestAnswer = {
          userId: userId,
          technicalTestId: technicalTestId,
          answers: JSON.stringify(
            payload.fields.map((field) => ({
              questionId: field.id,
              answer: field.answer.value,
            })),
          ),
          createdAt: payload.createdAt,
        };

        mutation.mutate(userAnswer);
      }
    };

    window.addEventListener("message", handleSumbitForm);
  });

  return (
    <>
      {/* {running && (
          <Countdown
            time={time}
            setTime={setTime}
            running={running}
            setRunning={setRunning}
          />
        )} */}
      {(running || finished) && (
        <iframe
          className="w-full"
          data-tally-src={tallyLink}
          loading="lazy"
          height="200"
          frameBorder={0}
          marginHeight={0}
          marginWidth={0}
          title="Newsletter"
        ></iframe>
      )}
      {!running && !finished && <h2>Time has run up!</h2>}

      <Script src="https://tally.so/widgets/embed.js" />
    </>
  );
}
