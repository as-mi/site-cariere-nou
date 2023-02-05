import { useEffect } from "react";
import { useFieldArray } from "react-hook-form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

import { TextField } from "../../forms";

import { CommonUseFormProps } from "./common";

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

  useEffect(() => {
    // When this component unmounts (such as when the user changes this question's type),
    // we want to unregister the corresponding field, to avoid running validations for it.
    return () => {
      unregister(name);
    };
  }, [unregister, name]);

  const { fields, append, remove } = useFieldArray({
    control,
    name,
    rules: { required: true },
  });

  const addNewChoice = () => {
    append({
      id: Math.floor(Math.random() * 65536),
      label: "",
    });
  };

  const removeChoice = (choiceIndex: number) => {
    if (window.confirm("Sigur vrei să ștergi această variantă de răspuns?")) {
      remove(choiceIndex);
    }
  };

  return (
    <div>
      <h4>Variante de răspuns</h4>

      <div className="space-y-1 p-2">
        {fields.map((choice, choiceIndex) => {
          const name =
            `questions.${questionIndex}.choices.${choiceIndex}` as const;
          return (
            <div key={choice.id} className="flex flex-row">
              <div className="pr-2">
                <button
                  type="button"
                  onClick={() => removeChoice(choiceIndex)}
                  className="hover:text-zinc-500 active:text-zinc-600"
                >
                  <FontAwesomeIcon icon={faClose} className="h-4 w-4" />
                </button>
              </div>
              <input
                type="hidden"
                {...register(`${name}.id`, { valueAsNumber: true })}
                className="hidden"
              />
              <TextField
                name={`${name}.label`}
                label="Variantă"
                required
                register={register}
                errors={errors}
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={addNewChoice}
        className="rounded-md bg-zinc-800 py-1 px-2 text-sm hover:bg-zinc-700 active:bg-zinc-600"
      >
        Adaugă o nouă variantă de răspuns
      </button>

      {errors.questions?.[questionIndex]?.choices?.root?.type ===
        "required" && (
        <p className="mt-2 text-sm">
          Trebuie adăugată cel puțin o variantă de răspuns
        </p>
      )}
    </div>
  );
};

export default QuestionChoicesEditor;
