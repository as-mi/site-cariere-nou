import { useFieldArray, useFormContext, UseFormWatch } from "react-hook-form";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { QuestionKind } from "~/lib/technical-tests-schema";

import { CommonFieldValues } from "./common";
import QuestionCard from "./question-card";

const QuestionsEditor: React.FC = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<CommonFieldValues>();

  const { fields, append, move, remove } = useFieldArray({
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
      kind: QuestionKind.SINGLE_CHOICE,
    });
  };

  const reorderQuestions = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
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
      <DndProvider backend={HTML5Backend}>
        <div className="pl-2 pt-1">
          {fields.map((question, index) => (
            <QuestionCard
              key={question.id}
              index={index}
              reorderQuestions={reorderQuestions}
              removeQuestion={removeQuestion}
            />
          ))}
        </div>
      </DndProvider>
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
