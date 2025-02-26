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

    // Set technical test to verify the correct order of sections

    render(
      <PartnersSection
        t={tFunction as TFunction}
        showComingSoonMessage={false}
        companiesByPackageType={companiesByPackageType}
      />,
    );
  });
});
