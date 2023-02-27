import { create } from "zustand";

type PreviousPageState = {
  previousPage?: string;
  setPreviousPage: (previousPage?: string) => void;
};

/**
 * Zustand store used for retaining what the previous page was.
 *
 * (only used by the home page <-> company page navigation flow)
 */
const usePreviousPageStore = create<PreviousPageState>((set) => ({
  previousPage: undefined,
  setPreviousPage: (previousPage?: string) => set({ previousPage }),
}));

export default usePreviousPageStore;
