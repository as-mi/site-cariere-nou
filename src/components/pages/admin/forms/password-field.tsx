import { FieldValues } from "react-hook-form";

import InputField, { SpecializedInputFieldProps } from "./input-field";

const PasswordField = <IFormValues extends FieldValues>(
  props: SpecializedInputFieldProps<IFormValues>,
) => <InputField type="password" {...props} />;

export default PasswordField;
