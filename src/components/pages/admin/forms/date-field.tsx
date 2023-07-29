import { FieldValues } from "react-hook-form";

import InputField, { SpecializedInputFieldProps } from "./input-field";

const DateField = <IFormValues extends FieldValues>(
  props: SpecializedInputFieldProps<IFormValues>,
) => <InputField type="date" {...props} />;

export default DateField;
