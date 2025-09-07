import { clean } from "./clean";

describe("clean function", () => {
  test.each([
    ["1990 (?)", "1990"],
    ["Early 1990s", "early 1990s"],
  ])("clean('%s') -> %p", (input, expected) => {
    expect(clean(input as string)).toBe(expected);
  });
});
