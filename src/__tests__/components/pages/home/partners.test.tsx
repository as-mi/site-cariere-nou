import { render, screen } from "@testing-library/react";

import PartnersSection from "~/components/pages/home/partners";

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
    const companiesByPackageType = { BRONZE: [], GOLD: [], SILVER: [] };

    render(
      <PartnersSection
        t={tFunction}
        companiesByPackageType={companiesByPackageType}
      />
    );

    const subsectionHeaders = screen.getAllByText(
      "partnersSection.subsectionHeader",
      { exact: false }
    );

    // Make sure we have all of the subsection headers rendered
    expect(subsectionHeaders).toHaveLength(3);

    // Make sure they are in the right order
    expect(subsectionHeaders[0]).toHaveTextContent(/GOLD/);
    expect(subsectionHeaders[1]).toHaveTextContent(/SILVER/);
    expect(subsectionHeaders[2]).toHaveTextContent(/BRONZE/);
  });
});
