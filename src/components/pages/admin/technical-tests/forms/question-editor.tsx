import { UseFormWatch } from "react-hook-form";

import { QuestionType } from "~/lib/technical-tests-schema";

import { SelectField, TextAreaField, TextField } from "../../forms";

import { CommonFieldValues, CommonUseFormProps } from "./common";
import QuestionChoicesEditor from "./question-choices-editor";

interface QuestionEditorProps extends CommonUseFormProps {
  index: number;
  watch: UseFormWatch<CommonFieldValues>;
}

const QUESTION_TYPE_OPTIONS = [
  { value: QuestionType.SINGLE_CHOICE, label: "Alegere unică" },
  { value: QuestionType.SHORT_TEXT, label: "Text scurt" },
  { value: QuestionType.LONG_TEXT, label: "Text lung" },
];

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  index,
  control,
  watch,
  register,
  unregister,
  errors,
}) => {
  const name = `questions.${index}` as const;
  const watchQuestionType = watch(`${name}.type`);

  return (
    <div>
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
          errors={errors}
        />

        <TextAreaField
          name={`${name}.details`}
          label="Detalii"
          register={register}
          errors={errors}
        />

        <SelectField
          name={`${name}.type`}
          label="Tip întrebare"
          options={QUESTION_TYPE_OPTIONS}
          register={register}
          errors={errors}
        />

        {watchQuestionType === QuestionType.SINGLE_CHOICE && (
          <QuestionChoicesEditor
            control={control}
            register={register}
            unregister={unregister}
            errors={errors}
            questionIndex={index}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionEditor;
