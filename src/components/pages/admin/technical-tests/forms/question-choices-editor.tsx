import { useCallback, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import _ from "lodash";

import { CommonFieldValues } from "./common";
import QuestionChoice from "./question-choice";
import useMemoCompare from "~/hooks/use-memo-compare";

type QuestionChoicesEditorProps = {
  questionIndex: number;
};

const QuestionChoicesEditor: React.FC<QuestionChoicesEditorProps> = ({
  questionIndex,
}) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CommonFieldValues>();

  const questionFieldName = `questions.${questionIndex}` as const;
  const name = `${questionFieldName}.choices` as const;
  const choicesFieldErrors = errors.questions?.[questionIndex]?.choices?.root;

  const correctChoiceId = watch(`${questionFieldName}.correctChoiceId`);

  const { fields, append, move, remove } = useFieldArray({
    keyName: "_id",
    control,
    name,
    rules: { required: true },
  });

  const addNewChoice = () => {
    const ids = fields.map((field) => field.id);
    if (ids.length === 0) {
      ids.push(0);
    }
    const id = Math.max(...ids) + 1;
    append({
      id,
      label: "",
    });
  };

  const reorderChoices = useCallback(
    (fromChoiceIndex: number, toChoiceIndex: number) => {
      move(fromChoiceIndex, toChoiceIndex);
    },
    [move],
  );

  const removeChoice = useCallback(
    (choiceIndex: number) => {
      if (window.confirm("Sigur vrei să ștergi această variantă de răspuns?")) {
        remove(choiceIndex);
      }
    },
    [remove],
  );

  const clearCorrectChoice = () => {
    setValue(`${questionFieldName}.correctChoiceId`, undefined);
  };

  const memoizedFields = useMemoCompare(fields, _.isEqual);
  const choices = useMemo(
    () =>
      memoizedFields.map((choice, choiceIndex) => (
        <QuestionChoice
          key={choice.id}
          questionIndex={questionIndex}
          choiceIndex={choiceIndex}
          reorderChoices={reorderChoices}
          removeChoice={removeChoice}
        />
      )),
    [memoizedFields, questionIndex, reorderChoices, removeChoice],
  );

  return (
    <div>
      <h4>Variante de răspuns</h4>

      <div className="space-y-4 pt-2 pr-4 pb-4 pl-2">{choices}</div>

      <div className="flex w-64 flex-col gap-2">
        <button
          onClick={addNewChoice}
          className="rounded-md bg-zinc-800 py-1 px-2 text-sm hover:bg-zinc-700 active:bg-zinc-600"
        >
          Adaugă o nouă variantă de răspuns
        </button>
        {correctChoiceId !== undefined && (
          <button
            onClick={clearCorrectChoice}
            className="rounded-md bg-zinc-800 py-1 px-2 text-sm hover:bg-zinc-700 active:bg-zinc-600"
          >
            Elimină răspunsul corect
          </button>
        )}
      </div>

      {choicesFieldErrors?.type === "required" && (
        <p className="mt-2 text-sm">
          Trebuie adăugată cel puțin o variantă de răspuns
        </p>
      )}
    </div>
  );
};

export default QuestionChoicesEditor;
