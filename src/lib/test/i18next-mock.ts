import * as i18next from "react-i18next";

jest.mock("react-i18next", () => ({
  __esModule: true,
  // This mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (key: string) => key,
    };
  },
}));

const i18nextMock = i18next as unknown as jest.Mocked<typeof i18next>;

export default i18nextMock;
