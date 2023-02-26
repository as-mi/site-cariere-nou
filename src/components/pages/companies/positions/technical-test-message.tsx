import Link from "next/link";

type TechnicalTestMessageProps = {
  technicalTestId: number;
  mandatory: boolean;
  onSkip: () => void;
  onCancel: () => void;
};

const TechnicalTestMessage: React.FC<TechnicalTestMessageProps> = ({
  technicalTestId,
  mandatory,
  onSkip,
  onCancel,
}) => (
  <>
    <p>
      {mandatory
        ? "Pentru a putea aplica pe acest post, va trebui să răspunzi mai întâi la întrebările din testul tehnic asociat."
        : "Înainte de a aplica pe acest post, este recomandat să completezi testul tehnic asociat."}
    </p>
    <div className="mt-3 space-x-3">
      <Link
        href={`/technical-tests/${technicalTestId}`}
        className="inline-block rounded-md bg-green-700 px-3 py-2 text-white hover:bg-green-800 active:bg-green-900"
      >
        Deschide testul tehnic
      </Link>
      {!mandatory && (
        <button
          type="button"
          onClick={onSkip}
          className="rounded-md bg-yellow-300 px-3 py-2 hover:bg-yellow-200"
        >
          Sari peste
        </button>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md bg-zinc-200 px-3 py-2 hover:bg-zinc-100"
      >
        Anulează
      </button>
    </div>
  </>
);

export default TechnicalTestMessage;
