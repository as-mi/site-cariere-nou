import { FieldValues } from "react-hook-form";

import InputField, { InputFieldPropsWithoutType } from "./input-field";

const TextField = <IFormValues extends FieldValues>(
  props: InputFieldPropsWithoutType<IFormValues>
) => <InputField type="text" {...props} />;

export default TextField;
