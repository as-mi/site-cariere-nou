import { useFieldArray, UseFormWatch } from "react-hook-form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

import { QuestionType } from "~/lib/technical-tests-schema";

import { CommonFieldValues, CommonUseFormProps } from "./common";
import QuestionEditor from "./question-editor";

interface QuestionsEditorProps extends CommonUseFormProps {
  watch: UseFormWatch<CommonFieldValues>;
}

const QuestionsEditor: React.FC<QuestionsEditorProps> = ({
  control,
  watch,
  register,
  unregister,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    keyName: "_id",
    control,
    name: "questions",
    rules: { required: true },
  });

  const addNewQuestion = () => {
    const ids = fields.map((field) => field.id);
    if (ids.length === 0) {
      ids.push(0);
    }
    const id = Math.max(...ids) + 1;
    append({
      id,
      title: "",
      details: "",
      type: QuestionType.SINGLE_CHOICE,
    });
  };

  const removeQuestion = (questionIndex: number) => {
    if (
      window.confirm(
        "Sigur vrei să ștergi această întrebare și toate datele asociate ei?"
      )
    ) {
      remove(questionIndex);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Întrebări</h2>
      <div className="pl-2 pt-1">
        {fields.map((question, index) => (
          <div key={question.id} className="flex flex-row">
            <div className="pr-2">
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="hover:text-zinc-500 active:text-zinc-600"
              >
                <FontAwesomeIcon icon={faClose} className="h-4 w-4" />
              </button>
            </div>
            <QuestionEditor
              index={index}
              control={control}
              watch={watch}
              register={register}
              unregister={unregister}
              errors={errors}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addNewQuestion}
        className="mt-3 rounded-md bg-zinc-800 py-2 px-3 hover:bg-zinc-700 active:bg-zinc-600"
      >
        Adaugă o nouă intrebare
      </button>
      {errors.questions?.root?.type === "required" && (
        <p className="mt-3">Trebuie adăugată cel puțin o întrebare</p>
      )}
    </div>
  );
};

export default QuestionsEditor;
