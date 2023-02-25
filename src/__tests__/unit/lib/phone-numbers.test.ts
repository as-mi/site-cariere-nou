import { PHONE_NUMBER_PATTERN } from "~/lib/phone-numbers";

describe("phone number pattern", () => {
  it("matches valid phone numbers", () => {
    expect("0712345678").toMatch(PHONE_NUMBER_PATTERN);
    expect("0712.345.678").toMatch(PHONE_NUMBER_PATTERN);
    expect("0712 345 678").toMatch(PHONE_NUMBER_PATTERN);
  });

  it("rejects invalid phone numbers", () => {
    expect("abcdefghij").not.toMatch(PHONE_NUMBER_PATTERN);
    expect("0712\t345\t678").not.toMatch(PHONE_NUMBER_PATTERN);
  });
});
