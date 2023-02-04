import type { MatcherFunction } from "expect";

/**
 * Checks whether a given HTML element is "hidden",
 * i.e. if it or any of its parents have the `hidden` class name.
 */
export const toBeHidden: MatcherFunction = function (received) {
  if (!received) {
    return {
      pass: true,
      message: () => "Null elements are certainly hidden",
    };
  }

  if (!(received instanceof HTMLElement)) {
    throw new Error("`toBeHidden` matcher only works with HTML elements");
  }

  const hidden = received.closest(".hidden");

  if (this.isNot) {
    expect(hidden).not.toBeTruthy();

    return {
      pass: false,
      message: () => "Element is not hidden",
    };
  } else {
    expect(hidden).toBeTruthy();

    return {
      pass: true,
      message: () => "Element is hidden",
    };
  }
};
