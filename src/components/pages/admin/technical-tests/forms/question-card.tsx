import { useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";

import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";

import QuestionEditor from "./question-editor";

type QuestionCardProps = {
  index: number;
  reorderQuestions: (from: number, to: number) => void;
  removeQuestion: (index: number) => void;
};

type DragItem = {
  index: number;
};

const QUESTION_CARD_ITEM_TYPE = Symbol("QUESTION");

const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  reorderQuestions,
  removeQuestion,
}) => {
  const item: DragItem = { index };
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: QUESTION_CARD_ITEM_TYPE,
    item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: QUESTION_CARD_ITEM_TYPE,
    drop: (item: DragItem) => reorderQuestions(item.index, index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const ref = useCallback(
    (div: HTMLElement | null) => {
      dragPreview(div);
      drop(div);
    },
    [dragPreview, drop],
  );

  return (
    <div
      ref={ref}
      className={classNames(
        "flex flex-row",
        { "opacity-25": isDragging },
        { "bg-zinc-800": isOver },
      )}
    >
      <div className="flex flex-col pr-3">
        <button
          type="button"
          onClick={() => removeQuestion(index)}
          className="hover:text-zinc-500 active:text-zinc-600"
        >
          <span title="Șterge întrebarea">
            <FontAwesomeIcon icon={faClose} className="h-4 w-4" />
          </span>
        </button>
        <button type="button" ref={drag}>
          <span title="Reordonează">
            <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
          </span>
        </button>
      </div>

      <div className="grow">
        <QuestionEditor index={index} />
      </div>
    </div>
  );
};

export default QuestionCard;
