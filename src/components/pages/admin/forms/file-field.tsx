import { FieldValues } from "react-hook-form";

import InputField, { InputFieldProps } from "./input-field";

interface FileFieldProps<IFormValues extends FieldValues>
  extends Omit<InputFieldProps<IFormValues>, "type"> {
  accept: string;
}

const FileField = <IFormValues extends FieldValues>(
  props: FileFieldProps<IFormValues>
) => <InputField type="file" {...props} />;

export default FileField;
