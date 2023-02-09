import { FieldValues } from "react-hook-form";

import classNames from "classnames";

import InputField, { InputFieldProps } from "./input-field";

interface FileFieldProps<IFormValues extends FieldValues>
  extends Omit<InputFieldProps<IFormValues>, "type"> {
  accept: string;
}

const FileField = <IFormValues extends FieldValues>({
  inputClassName,
  ...props
}: FileFieldProps<IFormValues>) => (
  <InputField
    type="file"
    inputClassName={classNames("w-full", inputClassName)}
    {...props}
  />
);

export default FileField;
