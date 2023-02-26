import { useEffect, useState } from "react";

import classNames from "classnames";

type PositionDescriptionProps = {
  descriptionHtml: string;
  onExpand?: (expanded: boolean) => void;
};

const PositionDescription: React.FC<PositionDescriptionProps> = ({
  descriptionHtml,
  onExpand,
}) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    onExpand?.(expanded);
  }, [onExpand, expanded]);

  return (
    <div
      className={classNames("relative my-1", {
        "max-h-64 overflow-hidden": !expanded,
      })}
    >
      <div
        className="prose mx-auto max-w-prose"
        dangerouslySetInnerHTML={{
          __html: descriptionHtml,
        }}
      />
      {!expanded && (
        <div className="absolute bottom-0 z-10 w-full">
          <div className="h-8 w-full bg-gradient-to-b from-transparent to-white" />
          <div className="h-16 w-full bg-white" />
        </div>
      )}
      <div
        className={classNames("w-full px-4 text-center", {
          "absolute bottom-4 z-20": !expanded,
        })}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-lg bg-blue-600 px-2 py-1 text-white drop-shadow-lg hover:bg-blue-700 active:bg-blue-800"
        >
          {expanded ? "Arată mai puțin" : "Arată mai mult"}
        </button>
      </div>
    </div>
  );
};

export default PositionDescription;
