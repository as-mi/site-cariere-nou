import { render, screen } from "@testing-library/react";

import "~/lib/test/i18next-mock";

import HomePage from "~/pages/index";

jest.mock("~/hooks/use-role", () => ({
  __esModule: true,
  default: () => undefined,
  useIsAdmin: () => false,
}));

describe("Home", () => {
  it("renders a heading", () => {
    render(
      <HomePage
        baseUrl="http://localhost:3000/"
        showComingSoonMessage={false}
        alwaysShowCompaniesForAdmin={true}
        hideProfileLink={false}
        showEvents={true}
        alwaysShowEventsForAdmin={true}
        closeApplications={false}
        companiesByPackageType={{}}
        events={[]}
      />,
    );

    const heroImage = screen.getByAltText("Cariere v14.0");

    expect(heroImage).toBeInTheDocument();
  });
});
