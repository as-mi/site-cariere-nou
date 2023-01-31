import { FieldValues } from "react-hook-form";

import InputField, { SpecializedInputFieldProps } from "./input-field";

const EmailField = <IFormValues extends FieldValues>(
  props: SpecializedInputFieldProps<IFormValues>
) => <InputField type="email" {...props} />;

export default EmailField;
