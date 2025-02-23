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
  const [showModal, setShowModal] = useState(false); 

  const isShortContent = descriptionHtml.length < 130; // Aici ca sa se vada si cand este scurt continutul

  useEffect(() => {
    onExpand?.(expanded);
  }, [onExpand, expanded]);

  return (
    <>
      {/* Main Content */}
      <div
        className={classNames("relative my-1", {
          "max-h-64 overflow-hidden": !expanded && !isShortContent, 
        })}
      >
        <div
          className="prose mx-auto min-h-[5rem] max-w-prose"
          dangerouslySetInnerHTML={{
            __html: descriptionHtml,
          }}
        />
        {!expanded && !isShortContent && (
          <div className="absolute bottom-0 z-10 w-full">
            <div className="h-8 w-full bg-gradient-to-b from-transparent to-white" />
            <div className="h-16 w-full bg-white" />
          </div>
        )}
      </div>

      {/* Button to Open Modal (with animation) */}
      <div className="w-full px-4 text-center mt-4">
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow-md 
          hover:bg-blue-700 active:scale-95 transition-all duration-200"
        >
          Arată mai mult
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm 
          transition-opacity duration-300 animate-fadeIn z-50"
        >
          {/* Click outside to close */}
          <div
            className="absolute inset-0"
            onClick={() => setShowModal(false)}
          ></div>

          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-2xl relative z-50 
            transition-all duration-300 animate-slideUp"
          >
            {/* Close Button (with hover effect) */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 bg-gray-300 hover:bg-gray-400 rounded-full w-8 h-8 flex items-center justify-center
              transition-transform duration-200 hover:scale-110"
            >
              ✕
            </button>

            {/* Modal Content */}
            <h2 className="text-xl font-bold mb-4 text-center">
              Descriere Completă
            </h2>
            <div
              className="prose max-w-prose overflow-y-auto max-h-[60vh] p-2"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        </div>
      )}

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }

          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
};

export default PositionDescription;
