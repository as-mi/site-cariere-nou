import { FieldValues } from "react-hook-form";

import InputField, { SpecializedInputFieldProps } from "./input-field";

const TextField = <IFormValues extends FieldValues>(
  props: SpecializedInputFieldProps<IFormValues>,
) => <InputField type="text" {...props} />;

export default TextField;
