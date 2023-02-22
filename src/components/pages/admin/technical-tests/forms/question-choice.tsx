import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useDrag, useDrop } from "react-dnd";

import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";

import { ControlledRadioField, TextField } from "../../forms";
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
    control,
    register,
    formState: { errors },
    watch,
  } = useFormContext<CommonFieldValues>();

  const questionFieldName = `questions.${questionIndex}` as const;
  const name = `${questionFieldName}.choices.${choiceIndex}` as const;

  const questionError = errors?.questions?.[questionIndex];
  const choiceError = questionError?.choices?.[choiceIndex];

  const id = watch(`${name}.id`);

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
      <div>
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
          fieldErrors={choiceError?.label}
          wrapperClassName="grow"
        />
        <ControlledRadioField
          name={`${questionFieldName}.correctChoiceId`}
          value={id}
          label={"Este răspunsul corect"}
          control={control}
          fieldErrors={questionError?.correctChoiceId}
          wrapperClassName="mt-1"
        />
      </div>
    </div>
  );
};

export default QuestionChoice;
