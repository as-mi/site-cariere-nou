import { FieldValues } from "react-hook-form";

import InputField, { InputFieldPropsWithoutType } from "./input-field";

const EmailField = <IFormValues extends FieldValues>(
  props: InputFieldPropsWithoutType<IFormValues>
) => <InputField type="email" {...props} />;

export default EmailField;
