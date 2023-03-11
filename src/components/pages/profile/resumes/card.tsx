import classNames from "classnames";

import { TFunction } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

import { Resume } from "./common";

type ResumeCardProps = {
  t: TFunction;
  index: number;
  resume: Resume;
  replacementAllowed?: boolean;
  replacing?: boolean;
  onReplace: () => void;
  onDelete: () => void;
};

const ResumeCard: React.FC<ResumeCardProps> = ({
  t,
  index,
  resume,
  replacementAllowed,
  replacing,
  onReplace,
  onDelete,
}) => (
  <div
    className={classNames("flex flex-row flex-wrap border p-3", {
      "border-cyan-200 bg-cyan-50": replacing,
    })}
  >
    <span className="mr-3 font-semibold">
      {t("resumesDisplay.resumeTitle", { resumeIndex: index + 1 })}:
    </span>
    <span className="float-right ml-auto space-x-4">
      {replacementAllowed && (
        <button type="button" title="Înlocuiește acest CV" onClick={onReplace}>
          <FontAwesomeIcon
            icon={faPen}
            className="h-5 w-5 text-yellow-400 hover:text-amber-400 active:text-orange-400 sm:h-4 sm:w-4"
          />
        </button>
      )}
      <button type="button" title="Șterge acest CV" onClick={onDelete}>
        <FontAwesomeIcon
          icon={faTrash}
          className="h-5 w-5 text-red-600 hover:text-red-700 active:text-red-800 sm:h-4 sm:w-4"
        />
      </button>
    </span>
    <span className="mt-2 w-full">
      &quot;
      {resume.fileName}
      &quot;
    </span>
  </div>
);

export default ResumeCard;

ResumeCard.defaultProps = {
  replacementAllowed: false,
  replacing: false,
};
