import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useDrag, useDrop } from "react-dnd";

import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";

import { TextField } from "../../forms";
import { CommonFieldValues } from "./common";

type QuestionChoiceProps = {
  questionIndex: number;
  choiceIndex: number;
  reorderChoices: (from: number, to: number) => void;
  removeChoice: (index: number) => void;
};

type DragItem = {
  index: number;
};

const QUESTION_CHOICE_ITEM_TYPE = Symbol("CHOICE");

const QuestionChoice: React.FC<QuestionChoiceProps> = ({
  questionIndex,
  choiceIndex,
  reorderChoices,
  removeChoice,
}) => {
  const {
    formState: { errors },
    register,
  } = useFormContext<CommonFieldValues>();
  const name = `questions.${questionIndex}.choices.${choiceIndex}` as const;
  const labelError =
    errors?.questions?.[questionIndex]?.choices?.[choiceIndex]?.label;

  const item: DragItem = { index: choiceIndex };
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: QUESTION_CHOICE_ITEM_TYPE,
    item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: QUESTION_CHOICE_ITEM_TYPE,
    drop: (item: DragItem) => reorderChoices(item.index, choiceIndex),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const ref = useCallback(
    (div: HTMLElement | null) => {
      dragPreview(div);
      drop(div);
    },
    [dragPreview, drop]
  );

  return (
    <div
      ref={ref}
      className={classNames(
        "flex flex-row",
        { "opacity-25": isDragging },
        { "bg-zinc-800": isOver }
      )}
    >
      <div className="flex flex-col pr-2">
        <button
          type="button"
          onClick={() => removeChoice(choiceIndex)}
          className="hover:text-zinc-500 active:text-zinc-600"
        >
          <FontAwesomeIcon icon={faClose} className="h-4 w-4" />
        </button>
        <button type="button" ref={drag}>
          <span title="Reordonează">
            <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
          </span>
        </button>
      </div>
      <input
        type="hidden"
        {...register(`${name}.id`, { valueAsNumber: true })}
        className="hidden"
      />
      <TextField
        name={`${name}.label`}
        label={`Varianta #${choiceIndex + 1}`}
        required
        register={register}
        fieldErrors={labelError}
        wrapperClassName="grow"
      />
    </div>
  );
};

export default QuestionChoice;
