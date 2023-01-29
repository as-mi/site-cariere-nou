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
    className={`bg-zinc-800 p-2 hover:bg-zinc-900 ${className ?? ""}`}
  >
    {label}
  </button>
);

SubmitButton.defaultProps = {
  label: "Trimite",
};

export default SubmitButton;
