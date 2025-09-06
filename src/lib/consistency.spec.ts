import { epochize, epochizeInner } from "./index";

const formalOptions = { convention: "formal" as const };

/**
 * Validating that certain strings start OR end at the same time.
 * Can't have the 21st century start at a different time than the year 2001.
 */
describe("consistency", () => {
  test.each([
    ["2001", "21st century"],
    ["21th century", "3rd millenium"],
  ])(`consistency - start - %s | %s`, (first, second) => {
    const [one, _one] = epochize(first, formalOptions)!;
    const [two, _two] = epochize(second, formalOptions)!;
    expect(one).toEqual(two);
  });

  test.each([["2000", "20th century"]])(
    `consistency - end - %s | %s`,
    (first, second) => {
      const [_one, one] = epochize(first, formalOptions)!;
      const [_two, two] = epochize(second, formalOptions)!;
      expect(one).toEqual(two);
    }
  );
});

describe("equivalence", () => {
  test.each([
    ["  2000  ", "2000"],
    ["2000", "2000 AD"],
    ["2001", "2001 AD"],
    ["Jan 1 2000", "2000/1/1"],
    // ["2001/01", "Jan 2001"],
    ["Jan 1st 2000", "Jan 1 2000"],
    ["April 3 2000", "Apr 3rd 2000"],
    ["June 3 2000", "Jun. 3rd 2000"],
    ["June 3, 2000", "Jun. 3rd, 2000"],
    ["June 3, 2000", "3 Jun 2000"],
  ])(`equivalence - %s | %s`, (first, second) => {
    const one = epochizeInner(first).get();
    const two = epochizeInner(second).get();

    expect(one).not.toBeNull();
    expect(two).not.toBeNull();

    expect(one![0]).toEqual(two![0]);
    expect(one![1]).toEqual(two![1]);
    expect(one![2].handler).toEqual(two![2].handler);
  });
});
