import classNames from "classnames";

export interface SubmitButtonProps {
  label: string;
  disabled?: boolean;
  className?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  label,
  disabled,
  className,
}) => (
  <button
    type="submit"
    disabled={disabled}
    className={classNames(
      "rounded-sm bg-zinc-800 p-2 enabled:hover:bg-zinc-900 disabled:text-zinc-400",
      className,
    )}
  >
    {label}
  </button>
);

SubmitButton.defaultProps = {
  label: "Trimite",
};

export default SubmitButton;
