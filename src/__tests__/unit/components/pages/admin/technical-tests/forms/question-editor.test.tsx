import { FormProvider, useForm } from "react-hook-form";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "~/lib/test/react-dnd-mock";

import { CommonFieldValues } from "~/components/pages/admin/technical-tests/forms/common";
import QuestionEditor from "~/components/pages/admin/technical-tests/forms/question-editor";

type FormWrapperProps = {
  onSubmit?: (data: CommonFieldValues) => void;
  children: React.ReactNode;
};

const FormWrapper: React.FC<FormWrapperProps> = ({ onSubmit, children }) => {
  const formMethods = useForm<CommonFieldValues>();

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit!)}>
        {children}
        <button type="submit" data-testid="submit">
          Submit
        </button>
      </form>
    </FormProvider>
  );
};

FormWrapper.defaultProps = {
  onSubmit: () => {},
};

describe("QuestionEditor", () => {
  it("can switch from single choice back to other question kinds", async () => {
    const user = userEvent.setup();

    const onSubmit = jest.fn();

    render(
      <FormWrapper onSubmit={onSubmit}>
        <QuestionEditor index={0} />
      </FormWrapper>
    );

    // Fill in the required question fields
    fireEvent.change(screen.getByLabelText("Titlu"), {
      target: { value: "Fake question" },
    });

    const questionKindSelect = screen.getByLabelText(
      "Tip de răspuns"
    ) as HTMLSelectElement;

    // First, switch the question's kind to single choice answer
    await user.selectOptions(questionKindSelect, "singleChoice");
    expect(questionKindSelect.value).toBe("singleChoice");

    // Now back to a short text answer
    await user.selectOptions(questionKindSelect, "shortText");
    expect(questionKindSelect.value).toBe("shortText");

    // Make sure we can submit successfully
    await user.click(screen.getByTestId("submit"));
    expect(onSubmit).toHaveBeenCalled();
  });
});
