import { FieldValues } from "react-hook-form";

import InputField, { InputFieldPropsWithoutType } from "./input-field";

const PasswordField = <IFormValues extends FieldValues>(
  props: InputFieldPropsWithoutType<IFormValues>
) => <InputField type="password" {...props} />;

export default PasswordField;
