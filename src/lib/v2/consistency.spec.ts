import { epochize } from "./parser";

/**
 * Validating that certain strings start OR end at the same time.
 * Can't have the 21st century start at a different time than the year 2001.
 */
describe("consistency", () => {
  test.each([
    ["2001", "21st century"],
    ["21th century", "3rd millenium"],
  ])(`consistency - start - %s | %s`, (first, second) => {
    const [one, _one] = epochize(first)!;
    const [two, _two] = epochize(second)!;
    expect(one).toEqual(two);
  });

  test.each([["2000", "20th century"]])(
    `consistency - end - %s | %s`,
    (first, second) => {
      const [_one, one] = epochize(first)!;
      const [_two, two] = epochize(second)!;
      expect(one).toEqual(two);
    }
  );
});

describe("equivalence", () => {
  test.each([
    ["2000", "2000 AD"],
    ["03/92", "3/92"],
  ])(`consistency - end - %s | %s`, (first, second) => {
    const [oneStart, oneEnd] = epochize(first)!;
    const [twoStart, twoEnd] = epochize(second)!;
    expect(oneStart).toEqual(twoStart);
    expect(oneEnd).toEqual(twoEnd);
  });
});
