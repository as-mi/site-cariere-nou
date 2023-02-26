import { useDrag, useDrop } from "react-dnd";

jest.mock("react-dnd", () => ({
  __esModule: true,
  useDrag: jest.fn(() => [{ isDragging: false }, () => {}, () => {}]),
  useDrop: jest.fn(() => [{ isOver: false }, () => {}]),
}));

export const useDragMock = useDrag as jest.Mocked<typeof useDrag>;
export const useDropMock = useDrop as jest.Mocked<typeof useDrop>;
