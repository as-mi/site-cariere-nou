import { useEffect } from "react";
import { useFieldArray } from "react-hook-form";

import { CommonUseFormProps } from "./common";
import QuestionChoice from "./question-choice";

interface QuestionChoicesEditorProps extends CommonUseFormProps {
  questionIndex: number;
}

const QuestionChoicesEditor: React.FC<QuestionChoicesEditorProps> = ({
  control,
  register,
  unregister,
  errors,
  questionIndex,
}) => {
  const name = `questions.${questionIndex}.choices` as const;
  const choicesFieldErrors = errors.questions?.[questionIndex]?.choices?.root;

  useEffect(() => {
    // When this component unmounts (such as when the user changes this question's type),
    // we want to unregister the corresponding field, to avoid running validations for it.
    return () => {
      unregister(name);
    };
  }, [unregister, name]);

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

  const reorderChoices = (fromChoiceIndex: number, toChoiceIndex: number) => {
    move(fromChoiceIndex, toChoiceIndex);
  };

  const removeChoice = (choiceIndex: number) => {
    if (window.confirm("Sigur vrei să ștergi această variantă de răspuns?")) {
      remove(choiceIndex);
    }
  };

  return (
    <div>
      <h4>Variante de răspuns</h4>

      <div className="space-y-1 pt-2 pr-4 pb-4 pl-2">
        {fields.map((choice, choiceIndex) => (
          <QuestionChoice
            key={choice.id}
            questionIndex={questionIndex}
            choiceIndex={choiceIndex}
            reorderChoices={reorderChoices}
            removeChoice={removeChoice}
            register={register}
            errors={errors}
          />
        ))}
      </div>

      <button
        onClick={addNewChoice}
        className="rounded-md bg-zinc-800 py-1 px-2 text-sm hover:bg-zinc-700 active:bg-zinc-600"
      >
        Adaugă o nouă variantă de răspuns
      </button>

      {choicesFieldErrors?.type === "required" && (
        <p className="mt-2 text-sm">
          Trebuie adăugată cel puțin o variantă de răspuns
        </p>
      )}
    </div>
  );
};

export default QuestionChoicesEditor;
