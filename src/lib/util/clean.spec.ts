import { clean } from "./clean";

describe("clean function", () => {
  test.each([["1990 (?)", "1990"]])("clean('%s') -> %p", (input, expected) => {
    expect(clean(input as string)).toBe(expected);
  });
});
