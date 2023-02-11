import { useFormContext } from "react-hook-form";

import { QuestionKind } from "~/lib/technical-tests-schema";

import { SelectField, TextAreaField, TextField } from "../../forms";

import { CommonFieldValues } from "./common";
import QuestionChoicesEditor from "./question-choices-editor";

type QuestionEditorProps = {
  index: number;
};

const QUESTION_TYPE_OPTIONS = [
  { value: QuestionKind.SINGLE_CHOICE, label: "Alegere unică" },
  { value: QuestionKind.SHORT_TEXT, label: "Text scurt" },
  { value: QuestionKind.LONG_TEXT, label: "Text lung" },
];

const QuestionEditor: React.FC<QuestionEditorProps> = ({ index }) => {
  const {
    formState: { errors },
    watch,
    register,
  } = useFormContext<CommonFieldValues>();

  const name = `questions.${index}` as const;
  const fieldErrors = errors?.questions?.[index];
  const watchQuestionKind = watch(`${name}.kind`);

  return (
    <>
      <h3 className="font-display text-lg font-semibold">
        Întrebarea #{index + 1}
      </h3>

      <input
        type="hidden"
        {...register(`${name}.id`, { valueAsNumber: true })}
        className="hidden"
      />

      <div className="space-y-2 py-2">
        <TextField
          name={`${name}.title`}
          label="Titlu"
          required
          register={register}
          fieldErrors={fieldErrors?.title}
        />

        <TextAreaField
          name={`${name}.details`}
          label="Detalii"
          register={register}
          fieldErrors={fieldErrors?.details}
        />

        <SelectField
          name={`${name}.kind`}
          label="Tip întrebare"
          options={QUESTION_TYPE_OPTIONS}
          register={register}
          fieldErrors={fieldErrors?.kind}
        />

        {watchQuestionKind === QuestionKind.SINGLE_CHOICE && (
          <QuestionChoicesEditor questionIndex={index} />
        )}
      </div>
    </>
  );
};

export default QuestionEditor;
