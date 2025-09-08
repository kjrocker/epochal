import { ordinalToNumber } from "./ordinal-to-number";

describe("ordinalToNumber function", () => {
  test.each([
    ["first century", "1st century"],
    ["second millennium", "2nd millennium"],
    ["third quarter", "3rd quarter"],
    ["fourth day", "4th day"],
    ["fifth month", "5th month"],
  ])("ordinalToNumber('%s') -> %p", (input, expected) => {
    expect(ordinalToNumber(input)).toBe(expected);
  });
});