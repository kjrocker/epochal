import { matchMonthRange } from "./month";
describe("matchMonthRange", () => {
  test.each([
    ["January-June 1918", "January 1918", "June 1918"],
    ["late January to early June 1919", "late January 1919", "early June 1919"],
    ["May to July 1919 bc", "May 1919 bc", "July 1919 bc"],
  ])("should split %s into %s and %s", (input, start, end) => {
    const result = matchMonthRange(input);
    expect(result).not.toBeNull();
    expect(result![0]).toBe(start);
    expect(result![1]).toBe(end);
  });
});
