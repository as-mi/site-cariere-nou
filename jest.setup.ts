import { expect } from "@jest/globals";

// `jest-dom` extends the built-in Jest expectations with ones useful for handling DOM objects
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

import { toBeHidden } from "~/lib/test/custom-matchers";

expect.extend({
  toBeHidden,
});
