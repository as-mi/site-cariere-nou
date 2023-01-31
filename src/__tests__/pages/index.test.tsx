import { render, screen } from "@testing-library/react";
import HomePage from "~/pages/index";

jest.mock("~/hooks/use-role", () => ({
  __esModule: true,
  default: () => undefined,
}));

jest.mock("react-i18next", () => ({
  // This mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (key: string) => key,
    };
  },
}));

describe("Home", () => {
  it("renders a heading", () => {
    render(<HomePage companiesByPackageType={{}} />);

    const heroImage = screen.getByAltText("Cariere v12.0");

    expect(heroImage).toBeInTheDocument();
  });
});
