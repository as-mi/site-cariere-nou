import { getServerSession } from "~/lib/auth";

jest.mock("~/lib/auth", () => ({
  getServerSession: jest.fn(),
}));

export const mockGetServerSession = getServerSession as unknown as jest.Mock;
