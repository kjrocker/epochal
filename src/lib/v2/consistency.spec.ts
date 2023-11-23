import { epochize } from ".";

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
    ["  2000  ", "2000"],
    ["2000", "2000 AD"],
    ["Jan 1 2000", "2000/1/1"],
    ["Jan 1st 2000", "Jan 1 2000"],
    ["April 3 2000", "Apr 3rd 2000"],
    ["June 3 2000", "Jun. 3rd 2000"],
    ["June 3, 2000", "Jun. 3rd, 2000"],
    ["June 3, 2000", "3 Jun 2000"],
    ["92/3", "92/3"],
  ])(`equivalence - %s | %s`, (first, second) => {
    const [oneStart, oneEnd] = epochize(first)!;
    const [twoStart, twoEnd] = epochize(second)!;
    expect(oneStart).toEqual(twoStart);
    expect(oneEnd).toEqual(twoEnd);
  });
});
