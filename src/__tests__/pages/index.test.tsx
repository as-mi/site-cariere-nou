import { render, screen } from "@testing-library/react";

import "~/lib/test/i18next-mock";

import HomePage from "~/pages/index";

jest.mock("~/hooks/use-role", () => ({
  __esModule: true,
  default: () => undefined,
}));

describe("Home", () => {
  it("renders a heading", () => {
    render(<HomePage companiesByPackageType={{}} />);

    const heroImage = screen.getByAltText("Cariere v12.0");

    expect(heroImage).toBeInTheDocument();
  });
});
