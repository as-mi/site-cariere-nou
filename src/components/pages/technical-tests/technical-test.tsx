import { useState } from "react";
import {
  FieldErrors,
  SubmitHandler,
  useForm,
  UseFormRegister,
} from "react-hook-form";

import { useRouter } from "next/router";

import { Answer, Question, QuestionType } from "~/lib/technical-tests-schema";
import { trpc } from "~/lib/trpc";

type TechnicalTestFieldValues = {
  answers: Answer[];
};

type TechnicalTestQuestionProps = {
  index: number;
  question: Question;
  register: UseFormRegister<TechnicalTestFieldValues>;
  errors: FieldErrors<TechnicalTestFieldValues>;
};

const TechnicalTestQuestion: React.FC<TechnicalTestQuestionProps> = ({
  index,
  question,
  register,
  errors,
}) => {
  const name = `answers.${index}` as const;
  const valueName = `${name}.value` as const;

  let input;
  switch (question.type) {
    case QuestionType.SHORT_TEXT:
      input = (
        <input
          type="text"
          {...register(valueName, { required: true })}
          className="mt-3 rounded-md bg-zinc-700 py-1 px-2"
        />
      );
      break;
    case QuestionType.LONG_TEXT:
      input = (
        <textarea
          {...register(valueName, { required: true })}
          className="mt-3 rounded-md bg-zinc-700 py-1 px-2"
        />
      );
      break;
    case QuestionType.SINGLE_CHOICE:
      input = (
        <div className="inline-flex flex-row flex-wrap gap-4">
          {question.choices!.map((choice) => {
            const inputId = `${valueName}-${choice.id}`;
            return (
              <div key={choice.id}>
                <input
                  id={inputId}
                  type="radio"
                  value={choice.id}
                  {...register(valueName, { required: true })}
                  className="mr-2"
                />
                <label htmlFor={inputId}>{choice.label}</label>
              </div>
            );
          })}
        </div>
      );
      break;
    default:
      throw new Error("Unknown question type");
  }

  return (
    <div key={question.id}>
      <h2>
        <span className="font-semibold">Întrebarea #{index + 1}:</span>{" "}
        {question.title}
      </h2>
      {question.details && <p className="my-1">{question.details}</p>}
      <input
        type="hidden"
        {...register(`${name}.questionId`, { value: question.id })}
        className="hidden"
      />
      {input}
      {errors.answers?.[index]?.value?.type === "required" && (
        <p className="mt-3">Trebuie să răspunzi la această întrebare</p>
      )}
    </div>
  );
};

type TechnicalTestProps = {
  companySlug: string;
  positionId: number;
  technicalTestId: number;
  questions: Question[];
};

const TechnicalTest: React.FC<TechnicalTestProps> = ({
  companySlug,
  positionId,
  technicalTestId,
  questions,
}) => {
  const [successfullySaved, setSuccessfullySaved] = useState(false);

  const router = useRouter();

  const mutation = trpc.participant.answerTechnicalTest.useMutation({
    onSuccess: () => {
      setSuccessfullySaved(true);
      setTimeout(() => {
        router.push(
          `/companies/${companySlug}?applyToPositionId=${positionId}`
        );
      }, 3000);
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TechnicalTestFieldValues>();

  const onSubmit: SubmitHandler<TechnicalTestFieldValues> = (data) => {
    mutation.mutate({
      technicalTestId,
      ...data,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-8">
      {questions.map((question, index) => (
        <TechnicalTestQuestion
          key={question.id}
          index={index}
          question={question}
          register={register}
          errors={errors}
        />
      ))}

      <button
        type="submit"
        disabled={mutation.isLoading}
        className="rounded-lg bg-blue-700 px-4 py-2 hover:bg-blue-600 active:bg-blue-500"
      >
        Trimite
      </button>

      {mutation.error && (
        <div className="mt-3 text-red-400">{mutation.error.message}</div>
      )}
      {successfullySaved && (
        <div className="mt-3">
          <div className="text-green-400">
            Răspunsurile au fost salvate cu succes!
          </div>
          Vei fi redirecționat imediat înapoi la formularul de aplicare.
        </div>
      )}
    </form>
  );
};

export default TechnicalTest;
