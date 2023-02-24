import { FieldValues } from "react-hook-form";

import InputField, { SpecializedInputFieldProps } from "./input-field";

const NumberField = <IFormValues extends FieldValues>(
  props: Omit<SpecializedInputFieldProps<IFormValues>, "valueAsNumber">
) => <InputField type="number" valueAsNumber {...props} />;

export default NumberField;
