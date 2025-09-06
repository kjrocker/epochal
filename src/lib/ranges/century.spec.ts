import { matchCenturyRange } from "./century";

describe("matchCenturyRange", () => {
  test.each([
    ["18th–19th century", "18th century", "19th century"],
    ["17th–18th century", "17th century", "18th century"],
    ["1st–3rd century", "1st century", "3rd century"],
    ["3rd–2nd century bc", "3rd century bc", "2nd century bc"],
    ["1st century bc–1st century ad", "1st century bc", "1st century ad"],
    ["late 18th–early 19th century", "late 18th century", "early 19th century"],
    ["mid 17th–18th century", "mid 17th century", "18th century"],
    [
      "mid 7th–end of the 6th century bce",
      "mid 7th century bce",
      "end of the 6th century bce",
    ],
    [
      "late 13th–first half 14th century",
      "late 13th century",
      "first half 14th century",
    ],
  ])("splits %s into %s and %s", (input, start, end) => {
    const result = matchCenturyRange(input);
    expect(result).toEqual([start, end]);
  });

  test.each([
    ["1800-1900", "non-century patterns"],
    ["18th century", "single century"],
    ["eighteen century", "non-matching patterns"],
  ])("should return null for %s: %s", (input) => {
    const result = matchCenturyRange(input);
    expect(result).toBeNull();
  });

  test.each([
    ["18th-19th century", "hyphens"],
    ["18th–19th century", "en-dashes"],
    ["18th—19th century", "em-dashes"],
  ])("should work with %s (%s)", (input) => {
    const result = matchCenturyRange(input);
    expect(result).toEqual(["18th century", "19th century"]);
  });
});
