import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "~/lib/test/i18next-mock";

import RegistrationForm from "~/components/pages/auth/register/form";

const testPasswordValidation = async (
  password: string,
  expectedErrorMessage: string
) => {
  const user = userEvent.setup();

  render(<RegistrationForm onSuccess={() => {}} />);

  const passwordInput = screen.getByLabelText("registrationForm.password");
  await user.type(passwordInput, password);

  const submitButton = screen.getByText("registrationForm.submit");
  await user.click(submitButton);

  const passwordErrorMessage = await screen.findByText(expectedErrorMessage);
  expect(passwordErrorMessage).toBeInTheDocument();
};

describe("RegistrationForm", () => {
  describe("validates the password", () => {
    it("must contain at least one digit", async () => {
      await testPasswordValidation(
        "abcdefgh!",
        "registrationForm.passwordMustHaveDigits"
      );
    });

    it("must contain at least one letter", async () => {
      await testPasswordValidation(
        "123456*",
        "registrationForm.passwordMustHaveAlpha"
      );
    });
  });
});
