import { render, screen } from "@testing-library/react";
import type { TFunction } from "next-i18next";

import PartnersSection from "~/components/pages/home/partners/section";

jest.mock("~/hooks/use-role", () => ({
  __esModule: true,
  useIsAdmin: () => false,
}));

describe("PartnersSection", () => {
  it("renders subsection in correct order", () => {
    // Mock the `t` function to also include the `packageType` interpolation parameter in the returned string
    const tFunction = (key: any, params?: any) => {
      if (key === "partnersSection.subsectionHeader") {
        return `${key}: ${params.packageType}`;
      }

      return key;
    };
    // Simulate getting data from the database in the incorrect order
    const companiesByPackageType = {
      BRONZE: [],
      GOLD: [],
      SILVER: [],
      PLATINUM: [],
    };

    render(
      <PartnersSection
        t={tFunction as TFunction}
        showComingSoonMessage={false}
        companiesByPackageType={companiesByPackageType}
      />,
    );

    const subsectionHeaders = screen.getAllByText(
      "partnersSection.subsectionHeader",
      { exact: false },
    );

    // Make sure we have all of the subsection headers rendered
    expect(subsectionHeaders).toHaveLength(4);

    // Make sure they are in the right order
    expect(subsectionHeaders[0]).toHaveTextContent(/PLATINUM/);
    expect(subsectionHeaders[1]).toHaveTextContent(/GOLD/);
    expect(subsectionHeaders[2]).toHaveTextContent(/SILVER/);
    expect(subsectionHeaders[3]).toHaveTextContent(/BRONZE/);
  });
});
